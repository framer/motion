/**
 * The parts of WebGPU the GPU layout engine uses. Declared here, rather
 * than through @webgpu/types, so Motion's published types don't depend on
 * them.
 */
export interface WGPU {
    requestAdapter(): Promise<WGPUAdapter | null>
}

export interface WGPUAdapter {
    requestDevice(): Promise<WGPUDevice>
}

export interface WGPUDevice {
    queue: WGPUQueue
    lost: Promise<unknown>
    createBuffer(descriptor: {
        size: number
        usage: number
        label?: string
    }): WGPUBuffer
    createShaderModule(descriptor: { code: string }): object
    createBindGroupLayout(descriptor: {
        entries: Array<{
            binding: number
            visibility: number
            buffer: {
                type: "uniform" | "storage" | "read-only-storage"
                hasDynamicOffset?: boolean
                minBindingSize?: number
            }
        }>
    }): object
    createPipelineLayout(descriptor: { bindGroupLayouts: object[] }): object
    createComputePipelineAsync(descriptor: {
        layout: object
        compute: { module: object; entryPoint: string }
    }): Promise<object>
    createBindGroup(descriptor: {
        layout: object
        entries: Array<{
            binding: number
            resource: { buffer: WGPUBuffer; size?: number }
        }>
    }): object
    createCommandEncoder(): WGPUCommandEncoder
}

export interface WGPUQueue {
    writeBuffer(
        buffer: WGPUBuffer,
        bufferOffset: number,
        data: ArrayBufferView,
        dataOffset?: number,
        size?: number
    ): void
    submit(commandBuffers: object[]): void
}

export interface WGPUBuffer {
    size: number
    mapAsync(mode: number, offset?: number, size?: number): Promise<void>
    getMappedRange(offset?: number, size?: number): ArrayBuffer
    unmap(): void
    destroy(): void
}

export interface WGPUCommandEncoder {
    beginComputePass(): WGPUComputePass
    copyBufferToBuffer(
        source: WGPUBuffer,
        sourceOffset: number,
        destination: WGPUBuffer,
        destinationOffset: number,
        size: number
    ): void
    finish(): object
}

export interface WGPUComputePass {
    setPipeline(pipeline: object): void
    setBindGroup(
        index: number,
        bindGroup: object,
        dynamicOffsets: Uint32Array,
        dynamicOffsetsStart: number,
        dynamicOffsetsLength: number
    ): void
    dispatchWorkgroups(x: number): void
    end(): void
}

/**
 * GPUBufferUsage, GPUShaderStage and GPUMapMode flags.
 */
export const MAP_READ = 1
export const COPY_SRC = 4
export const COPY_DST = 8
export const UNIFORM = 64
export const STORAGE = 128
export const COMPUTE = 4
