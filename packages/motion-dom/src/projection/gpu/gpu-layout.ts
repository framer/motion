import { frame, frameData } from "../../frameloop"
import { copyBoxInto } from "../geometry/copy"
import type { LayoutEngine } from "../node/layout-engine"
import {
    applyQuadStyles,
    calcQuadFollow,
    calcQuadLead,
    getSpace,
    layoutRect,
    measureQuad,
    readSpace,
    startQuadAnimation,
    stopQuadProjection,
} from "../node/quad-projection"
import type { IProjectionNode } from "../node/types"
import { createMat3, Mat3 } from "../quad/mat3"
import { valuesToHomography } from "../quad/transform"
import {
    animationTypes,
    BASE,
    createShader,
    FLAGS,
    IN,
    LEAD,
    LEVEL_STRIDE,
    LIVE,
    LEVELS,
    MIXED,
    OUT,
    OUTPUT,
    PARENT,
    PROGRESS,
    RECT,
    SPACE,
    START,
    VISUAL,
    WORKGROUP_SIZE,
} from "./shader"
import {
    COMPUTE,
    COPY_DST,
    COPY_SRC,
    MAP_READ,
    STORAGE,
    UNIFORM,
    WGPU,
    WGPUBuffer,
    WGPUDevice,
} from "./webgpu"

export interface GPULayout extends LayoutEngine {
    /**
     * Resolves true once WebGPU compute is ready. Resolves false if it
     * isn't available, in which case every layout animation this engine
     * would run is instant.
     */
    readonly ready: Promise<boolean>

    /**
     * Resolves once every frame computed so far has been read back and
     * rendered.
     */
    flush(): Promise<void>
}

/**
 * A readback buffer and the nodes whose results it carries.
 */
interface Readback {
    buffer: WGPUBuffer
    isBusy: boolean
    id: number
    size: number
    count: number
    slots: Uint32Array
    nodes: Array<IProjectionNode | undefined>
    onMapped: VoidFunction
    onFailed: VoidFunction
}

const READBACKS = 3

/**
 * A layout engine that runs quad projection's per-frame maths in a WebGPU
 * compute shader, for every projecting node at once.
 *
 * Measuring, and resolving where an animation starts, still happen on the
 * CPU, once per animation: the first frame of an animation has to be drawn
 * before any result can come back from the GPU. Every frame after that is
 * computed on the GPU.
 *
 * Results are read back asynchronously, so each frame is computed one
 * frame ahead, at the progress the animation will have reached when it's
 * drawn. Live transforms and spaces are those of the frame it's computed
 * in.
 *
 * Without WebGPU there's no CPU fallback: layout animations this engine
 * would run finish instantly.
 *
 * ```js
 * setLayoutEngine(createGPULayout())
 * ```
 */
export function createGPULayout(): GPULayout {
    let device: WGPUDevice | undefined
    let isInstant = false
    let pipeline: object | undefined
    let bindGroupLayout: object | undefined
    let bindGroup: object | undefined
    let inputBuffer: WGPUBuffer | undefined
    let rotationBuffer: WGPUBuffer | undefined
    let outputBuffer: WGPUBuffer | undefined
    let orderBuffer: WGPUBuffer | undefined
    let levelBuffer: WGPUBuffer | undefined

    /**
     * Slots, one per projecting node, and their CPU-side inputs.
     */
    let capacity = 0
    let used = 0
    let inputs = new Float32Array(0)
    let rotations = new Float32Array(0)
    let isRotationDirty = new Uint8Array(0)
    let owners: Array<IProjectionNode | undefined> = []
    const free: number[] = []
    const slots = new WeakMap<IProjectionNode, number>()

    /**
     * Slots to compute in the next submission.
     */
    let queued = new Uint32Array(0)
    let queuedCount = 0
    let isQueued = new Uint8Array(0)
    let isScheduled = false

    let levelOf = new Int32Array(0)
    let order = new Uint32Array(0)
    let levelCapacity = 0
    let levelCounts = new Uint32Array(0)
    let levelParams = new Uint32Array(0)
    let dynamicOffsets = new Uint32Array(0)
    const commands: object[] = []

    const readbacks: Readback[] = []
    let submitted = 0
    let applied = 0
    let needsSubmit = false
    const waiters: Array<{ target: number; resolve: VoidFunction }> = []

    const live = createMat3()
    const space = createMat3()

    const ownerOf = (slot: number) => owners[slot]

    const slotOf = (node: IProjectionNode) => {
        const slot = slots.get(node)
        return slot !== undefined && owners[slot] === node ? slot : undefined
    }

    function grow(size: number) {
        const next = Math.max(16, capacity * 2, size)

        const grown = (array: Float32Array, stride: number) => {
            const out = new Float32Array(next * stride)
            out.set(array)
            return out
        }
        inputs = grown(inputs, IN)
        rotations = grown(rotations, 1)

        const flags = (array: Uint8Array) => {
            const out = new Uint8Array(next)
            out.set(array)
            return out
        }
        isRotationDirty = flags(isRotationDirty)
        isQueued = flags(isQueued)
        const grownQueue = new Uint32Array(next)
        grownQueue.set(queued)
        queued = grownQueue
        levelOf = new Int32Array(next)
        order = new Uint32Array(next)

        const previous = capacity
        capacity = next
        device && createBuffers(previous)
    }

    /**
     * Make room for a tree this many levels deep.
     */
    function growLevels(size: number) {
        levelCapacity = Math.max(LEVELS, levelCapacity * 2, size)
        levelCounts = new Uint32Array(levelCapacity)
        levelParams = new Uint32Array((levelCapacity * LEVEL_STRIDE) / 4)
        dynamicOffsets = new Uint32Array(levelCapacity)
        for (let i = 0; i < levelCapacity; i++) {
            dynamicOffsets[i] = i * LEVEL_STRIDE
        }

        levelBuffer?.destroy()
        levelBuffer = undefined
        inputBuffer && bind()
    }
    growLevels(LEVELS)

    function createBuffers(previous: number) {
        const gpu = device!
        const oldRotations = rotationBuffer
        const oldOutputs = outputBuffer

        inputBuffer?.destroy()
        orderBuffer?.destroy()
        inputBuffer = gpu.createBuffer({
            size: capacity * IN * 4,
            usage: STORAGE | COPY_DST,
        })
        rotationBuffer = gpu.createBuffer({
            size: capacity * 4,
            usage: STORAGE | COPY_DST | COPY_SRC,
        })
        outputBuffer = gpu.createBuffer({
            size: capacity * OUT * 4,
            usage: STORAGE | COPY_DST | COPY_SRC,
        })
        orderBuffer = gpu.createBuffer({
            size: capacity * 4,
            usage: STORAGE | COPY_DST,
        })

        /**
         * Keep what the GPU owns: each lead's last rotation, and last
         * frame's visuals, which a node can be drawn in.
         */
        if (oldRotations && oldOutputs && previous) {
            const encoder = gpu.createCommandEncoder()
            encoder.copyBufferToBuffer(
                oldRotations,
                0,
                rotationBuffer,
                0,
                previous * 4
            )
            encoder.copyBufferToBuffer(
                oldOutputs,
                0,
                outputBuffer,
                0,
                previous * OUT * 4
            )
            commands[0] = encoder.finish()
            gpu.queue.submit(commands)
            oldRotations.destroy()
            oldOutputs.destroy()
        }

        bind()
    }

    function bind() {
        const gpu = device!
        levelBuffer ||= gpu.createBuffer({
            size: levelCapacity * LEVEL_STRIDE,
            usage: UNIFORM | COPY_DST,
        })
        bindGroup = gpu.createBindGroup({
            layout: bindGroupLayout!,
            entries: [
                { binding: 0, resource: { buffer: inputBuffer! } },
                { binding: 1, resource: { buffer: rotationBuffer! } },
                { binding: 2, resource: { buffer: outputBuffer! } },
                { binding: 3, resource: { buffer: orderBuffer! } },
                { binding: 4, resource: { buffer: levelBuffer, size: 16 } },
            ],
        })
    }

    function createReadback(): Readback {
        const readback: Readback = {
            buffer: device!.createBuffer({
                size: capacity * OUT * 4,
                usage: MAP_READ | COPY_DST,
            }),
            isBusy: false,
            id: 0,
            size: 0,
            count: 0,
            slots: new Uint32Array(capacity),
            nodes: [],
            onMapped: () => apply(readback),
            onFailed: () => release(readback),
        }
        return readback
    }

    /**
     * A free readback buffer big enough for every slot, or undefined if
     * they're all waiting on the GPU.
     */
    function takeReadback(): Readback | undefined {
        for (let i = 0; i < readbacks.length; i++) {
            const readback = readbacks[i]
            if (readback.isBusy) continue
            if (readback.slots.length < capacity) {
                readback.buffer.destroy()
                readbacks[i] = createReadback()
            }
            return readbacks[i]
        }
        if (readbacks.length < READBACKS) {
            const readback = createReadback()
            readbacks.push(readback)
            return readback
        }
        return undefined
    }

    function allocate(node: IProjectionNode) {
        let slot = slotOf(node)
        if (slot !== undefined) return slot

        slot = free.length ? free.pop()! : used++
        if (used > capacity) grow(used)

        owners[slot] = node
        slots.set(node, slot)
        inputs.fill(0, slot * IN, (slot + 1) * IN)
        return slot
    }

    function releaseNode(node: IProjectionNode) {
        const slot = slotOf(node)
        if (slot === undefined) return
        owners[slot] = undefined
        slots.delete(node)
        free.push(slot)
    }

    function write(at: number, m: Mat3 | Float64Array, length: number) {
        for (let i = 0; i < length; i++) inputs[at + i] = m[i]
    }

    function writeRect(at: number, node: IProjectionNode) {
        const { x, y } = node.quad!.rect
        inputs[at + RECT] = x.min
        inputs[at + RECT + 1] = y.min
        inputs[at + RECT + 2] = x.max
        inputs[at + RECT + 3] = y.max
    }

    /**
     * The space a node is drawn in. If its parent is projecting here too,
     * that's computed on the GPU this frame, so only the layers between
     * them are written.
     */
    function writeSpace(at: number, node: IProjectionNode) {
        const { parent } = node
        const parentSlot = parent?.quad?.active ? slotOf(parent) : undefined

        if (parentSlot !== undefined) {
            const env = node.layout?.quad?.env
            if (env) {
                write(at + SPACE, env, 9)
            } else {
                inputs.fill(0, at + SPACE, at + SPACE + 9)
                inputs[at + SPACE] = inputs[at + SPACE + 4] = 1
                inputs[at + SPACE + 8] = 1
            }
            inputs[at + PARENT] = parentSlot + 1
        } else {
            write(at + SPACE, getSpace(node, space), 9)
            inputs[at + PARENT] = 0
        }
    }

    function queue(slot: number) {
        if (!isQueued[slot]) {
            isQueued[slot] = 1
            queued[queuedCount++] = slot
        }
        if (!isScheduled) {
            isScheduled = true
            frame.preRender(submit, false, true)
        }
    }

    /**
     * The progress the node's animation will have reached next frame,
     * when this frame's results are drawn.
     */
    function nextProgress(node: IProjectionNode, progress: number) {
        const animation = node.currentAnimation
        if (
            !animation ||
            node.pendingAnimation ||
            animation.startTime === null ||
            !animation.sampleAt
        ) {
            return progress
        }

        const { delta } = frameData
        const next =
            frameData.timestamp + (delta > 0 && delta < 40 ? delta : 1000 / 60)
        return animation.sampleAt(next) / 1000
    }

    function calcLead(node: IProjectionNode, lead: IProjectionNode) {
        node.isTreeAnimating = true
        if (lead !== node || !node.layout) return

        const quad = node.quad!
        const slot = slotOf(node)
        if (slot === undefined) return

        const at = slot * IN

        /**
         * The first frame is drawn before any result can come back, so
         * it's computed here, which also resolves where the animation
         * starts in the node's space.
         */
        if (!quad.resolved) {
            calcQuadLead(node)
            write(at + START, quad.from, 8)
            write(at + BASE, quad.base, 8)
            rotations[slot] = quad.to[2]
            isRotationDirty[slot] = 1
        }

        writeRect(at, node)

        const { rect } = quad
        if (!node.measureTransform?.(rect, live)) {
            valuesToHomography(
                live,
                node.latestValues,
                rect.x.min,
                rect.y.min,
                rect.x.max - rect.x.min,
                rect.y.max - rect.y.min,
                node.layout.quad?.perspective
            )
        }
        write(at + LIVE, live, 9)
        writeSpace(at, node)

        inputs[at + PROGRESS] = nextProgress(node, quad.progress)
        inputs[at + LEAD] = 0
        inputs[at + FLAGS] =
            (quad.isShared ? 1 : 0) +
            2 * (animationTypes[node.options.animationType!] || 0)

        queue(slot)
        node.scheduleRender()
    }

    function calcFollow(node: IProjectionNode) {
        const lead = node.getLead()
        if (lead === node || !lead.quad?.active || !lead.quad.resolved) return

        const leadSlot = slotOf(lead)
        const rect = layoutRect(node)
        if (leadSlot === undefined || !rect) return

        let slot = slotOf(node)
        if (slot === undefined) {
            /**
             * As with leads, the first frame is drawn from the CPU.
             */
            calcQuadFollow(node)
            if (!node.quad?.active) return
            slot = allocate(node)
        }

        const quad = node.quad!
        const at = slot * IN
        copyBoxInto(quad.rect, rect)
        writeRect(at, node)
        writeSpace(at, node)
        inputs[at + LEAD] = leadSlot + 1

        quad.active = true
        queue(slot)
        node.scheduleRender(false)
    }

    /**
     * Each queued node's level: one more than the deepest queued node it
     * depends on.
     */
    function levelFor(slot: number): number {
        const known = levelOf[slot]
        if (known >= 0) return known

        /**
         * Guard against a cycle while this one resolves.
         */
        levelOf[slot] = 0

        let level = 0
        const at = slot * IN
        const parent = inputs[at + PARENT] - 1
        const lead = inputs[at + LEAD] - 1
        if (parent >= 0 && isQueued[parent]) {
            level = Math.max(level, levelFor(parent) + 1)
        }
        if (lead >= 0 && isQueued[lead]) {
            level = Math.max(level, levelFor(lead) + 1)
        }
        return (levelOf[slot] = level)
    }

    function submit() {
        isScheduled = false
        if (!queuedCount) return

        if (!device) {
            needsSubmit = !isInstant
            return
        }

        const readback = takeReadback()
        if (!readback) {
            needsSubmit = true
            return
        }
        needsSubmit = false

        /**
         * Drop nodes that unmounted mid-animation.
         */
        let count = 0
        for (let i = 0; i < queuedCount; i++) {
            const slot = queued[i]
            const node = ownerOf(slot)
            if (node?.instance) {
                queued[count++] = slot
                levelOf[slot] = -1
            } else {
                isQueued[slot] = 0
                node && releaseNode(node)
            }
        }
        queuedCount = count
        if (!count) return

        /**
         * Order slots by level.
         */
        let levels = 0
        for (let i = 0; i < count; i++) {
            levels = Math.max(levels, levelFor(queued[i]) + 1)
        }
        if (levels > levelCapacity) growLevels(levels)
        levelCounts.fill(0)
        for (let i = 0; i < count; i++) levelCounts[levelOf[queued[i]]]++
        let offset = 0
        for (let level = 0; level < levels; level++) {
            const at = (level * LEVEL_STRIDE) / 4
            levelParams[at] = offset
            levelParams[at + 1] = 0
            offset += levelCounts[level]
        }
        for (let i = 0; i < count; i++) {
            const slot = queued[i]
            const at = (levelOf[slot] * LEVEL_STRIDE) / 4
            order[levelParams[at] + levelParams[at + 1]++] = slot
            readback.slots[i] = slot
            readback.nodes[i] = ownerOf(slot)
            isQueued[slot] = 0
        }
        queuedCount = 0
        readback.count = count

        const gpu = device
        gpu.queue.writeBuffer(inputBuffer!, 0, inputs, 0, used * IN)
        for (let slot = 0; slot < used; slot++) {
            if (!isRotationDirty[slot]) continue
            isRotationDirty[slot] = 0
            gpu.queue.writeBuffer(rotationBuffer!, slot * 4, rotations, slot, 1)
        }
        gpu.queue.writeBuffer(orderBuffer!, 0, order, 0, count)
        gpu.queue.writeBuffer(
            levelBuffer!,
            0,
            levelParams,
            0,
            (levels * LEVEL_STRIDE) / 4
        )

        const encoder = gpu.createCommandEncoder()
        for (let level = 0; level < levels; level++) {
            const pass = encoder.beginComputePass()
            pass.setPipeline(pipeline!)
            pass.setBindGroup(0, bindGroup!, dynamicOffsets, level, 1)
            pass.dispatchWorkgroups(
                Math.ceil(levelCounts[level] / WORKGROUP_SIZE)
            )
            pass.end()
        }

        const size = used * OUT * 4
        encoder.copyBufferToBuffer(outputBuffer!, 0, readback.buffer, 0, size)
        commands[0] = encoder.finish()
        gpu.queue.submit(commands)

        readback.isBusy = true
        readback.id = ++submitted
        readback.size = size
        readback.buffer
            .mapAsync(MAP_READ, 0, size)
            .then(readback.onMapped, readback.onFailed)
    }

    /**
     * Copy a readback's results to its nodes, so they're drawn next frame.
     */
    function apply(readback: Readback) {
        const { count, slots: computed, nodes } = readback

        if (readback.id > applied) {
            applied = readback.id
            const results = new Float32Array(
                readback.buffer.getMappedRange(0, readback.size)
            )
            for (let i = 0; i < count; i++) {
                const slot = computed[i]
                const node = nodes[i]
                const quad = node?.quad
                if (!quad?.active || ownerOf(slot) !== node) continue

                const at = slot * OUT
                for (let j = 0; j < 9; j++) {
                    quad.output[j] = results[at + OUTPUT + j]
                    quad.visual[j] = results[at + VISUAL + j]
                }
                for (let j = 0; j < 8; j++) {
                    quad.mixed[j] = results[at + MIXED + j]
                }
                node!.scheduleRender()
            }
        }

        readback.buffer.unmap()
        release(readback)
    }

    function release(readback: Readback) {
        readback.isBusy = false
        readback.nodes.fill(undefined)
        if (needsSubmit) submit()
        if (waiters.length) frame.postRender(settle)
    }

    function settle() {
        for (let i = waiters.length - 1; i >= 0; i--) {
            if (applied >= waiters[i].target || !device) {
                waiters[i].resolve()
                waiters.splice(i, 1)
            }
        }
    }

    /**
     * Finish a node's animation as soon as it starts.
     */
    function finishInstantly(node: IProjectionNode) {
        node.quad!.active = false
        node.mixTargetDelta = () => {
            node.animationProgress = 1
            node.mixShared?.()
            node.root!.scheduleUpdateProjection()
            node.scheduleRender()
        }
        node.mixTargetDelta(1000)
    }

    function becomeInstant() {
        isInstant = true
        device = undefined
        needsSubmit = false
        for (let slot = 0; slot < used; slot++) {
            const node = ownerOf(slot)
            if (node?.quad?.active && node.isLead()) finishInstantly(node)
        }
        if (waiters.length) frame.postRender(settle)
    }

    const gpu: WGPU | undefined =
        typeof navigator !== "undefined"
            ? (navigator as unknown as { gpu?: WGPU }).gpu
            : undefined

    if (!gpu) isInstant = true

    const ready: Promise<boolean> = gpu
        ? gpu
              .requestAdapter()
              .then((adapter) => adapter?.requestDevice())
              .then(async (requested) => {
                  if (!requested) return false

                  const storage = (
                      binding: number,
                      type: "storage" | "read-only-storage"
                  ) => ({ binding, visibility: COMPUTE, buffer: { type } })

                  bindGroupLayout = requested.createBindGroupLayout({
                      entries: [
                          storage(0, "read-only-storage"),
                          storage(1, "storage"),
                          storage(2, "storage"),
                          storage(3, "read-only-storage"),
                          {
                              binding: 4,
                              visibility: COMPUTE,
                              buffer: {
                                  type: "uniform",
                                  hasDynamicOffset: true,
                                  minBindingSize: 16,
                              },
                          },
                      ],
                  })
                  pipeline = await requested.createComputePipelineAsync({
                      layout: requested.createPipelineLayout({
                          bindGroupLayouts: [bindGroupLayout],
                      }),
                      compute: {
                          module: requested.createShaderModule({
                              code: createShader(),
                          }),
                          entryPoint: "main",
                      },
                  })

                  device = requested
                  capacity ? createBuffers(0) : grow(16)
                  requested.lost.then(becomeInstant)

                  if (queuedCount) submit()
                  return true
              })
              .catch(() => false)
              .then((isReady) => {
                  isReady || becomeInstant()
                  return isReady
              })
        : Promise.resolve(false)

    return {
        ready,

        flush() {
            return ready.then(
                () =>
                    new Promise<void>((resolve) => {
                        const target =
                            submitted + (queuedCount || isScheduled ? 1 : 0)
                        waiters.push({ target, resolve })
                        frame.postRender(settle)
                    })
            )
        },

        readSpace,
        measureQuad,

        startAnimation(node, snapshot, isShared) {
            if (!startQuadAnimation(node, snapshot, isShared)) {
                releaseNode(node)
                return false
            }

            isInstant ? finishInstantly(node) : allocate(node)
            return true
        },

        calcLead,
        calcFollow,
        applyStyles: applyQuadStyles,

        stop(node) {
            stopQuadProjection(node)
            releaseNode(node)
            const stack = node.getStack()
            if (stack) {
                for (const member of stack.members) releaseNode(member)
            }
        },
    }
}
