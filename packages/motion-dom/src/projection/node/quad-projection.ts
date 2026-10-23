import type { Box, Delta, Point } from "motion-utils"
import type { ResolvedValues } from "../../render/types"
import { copyBoxInto } from "../geometry/copy"
import { createBox, createDelta } from "../geometry/models"
import {
    compose,
    createComponents,
    decompose,
    HomographyComponents,
    mixComponents,
    unwrapRotation,
} from "../quad/decompose"
import {
    conjugateTranslate,
    copyMat3,
    createMat3,
    identity,
    invert,
    isAxisAligned,
    Mat3,
    multiply,
    rectToRect,
    toMatrix3d,
} from "../quad/mat3"
import type { SpaceMeasurement } from "../quad/measure-space"
import {
    boxToQuad,
    copyQuad,
    createQuad,
    Quad,
    quadFromBox,
    transformBoxToQuad,
    transformQuad,
} from "../quad/quad"
import {
    hasNonAxisAlignedTransform,
    projectionToHomography,
    valuesToHomography,
} from "../quad/transform"
import type { IProjectionNode, Measurements, QuadMeasurements } from "./types"

/**
 * Quad projection
 *
 * The box engine describes every element as an axis-aligned box and every
 * projection as a translate and scale. That's exact, and fast, until an
 * element is drawn in a rotated, skewed or 3D space: its box is then only
 * the bounding box of what's visible, and a translate/scale can't move one
 * quad onto another.
 *
 * Quad projection describes an element as the four corners it's visible at
 * and its transforms as page-space homographies, which map any quad onto any
 * other. A layout animation decomposes the homographies at each end into
 * translate, rotate, scale, skew and perspective, mixes those, and renders
 * the result as a `matrix3d()`.
 *
 * Nodes only take this path when a box can't describe them, so the box
 * engine still handles, unchanged, every layout animation it could.
 *
 * Everything here works on preallocated typed arrays: nothing is allocated
 * per frame.
 */
export interface QuadProjection {
    /**
     * Whether this node is rendering a quad projection.
     */
    active: boolean

    /**
     * The lead's start components have been resolved against its space.
     */
    resolved: boolean

    progress: number

    /**
     * The snapshot's corners on the page.
     */
    origin: Quad

    /**
     * Where the snapshot's corners sit in this node's space, and the
     * components of the homography from `rect` onto them.
     */
    local: Quad
    from: HomographyComponents

    /**
     * Components of the node's live transform, and the mix of the two.
     */
    to: HomographyComponents
    mixed: HomographyComponents

    /**
     * Rotation to add to the shortest path, in degrees, when the snapshot
     * and lead have numeric rotations a whole turn or more apart.
     */
    turns: number

    /**
     * The page-space homography of everything this node is drawn in: its
     * projection parent's visual transform, then the environment between.
     */
    space: Mat3

    /**
     * This node's own transform, in page space.
     */
    output: Mat3

    /**
     * `space * output`: how the node maps from its layout to the page.
     */
    visual: Mat3

    /**
     * The untransformed page box `output` applies to.
     */
    rect: Box

    /**
     * A stand-in node for scale correctors, which read the projected size
     * from `target`, `projectionDelta` and `treeScale`.
     */
    correction: {
        target: Box
        projectionDelta: Delta
        treeScale: Point
    }
}

export function createQuadProjection(): QuadProjection {
    return {
        active: false,
        resolved: false,
        progress: 0,
        origin: createQuad(),
        local: createQuad(),
        from: createComponents(),
        to: createComponents(),
        mixed: createComponents(),
        turns: 0,
        space: createMat3(),
        output: createMat3(),
        visual: createMat3(),
        rect: createBox(),
        correction: {
            target: createBox(),
            projectionDelta: createDelta(),
            treeScale: { x: 1, y: 1 },
        },
    }
}

export type MeasureSpace<I> = (
    instance: I,
    parent: IProjectionNode | undefined,
    out: SpaceMeasurement,
    force: boolean
) => boolean

const space: SpaceMeasurement = {
    rect: /* @__PURE__ */ createBox(),
    env: /* @__PURE__ */ createMat3(),
    perspective: /* @__PURE__ */ new Float64Array(3),
}

const has3DTransform = (values: ResolvedValues) =>
    Boolean(values.rotateX || values.rotateY || values.z)

/**
 * Whether a tracked node turns, shears or foreshortens its subtree.
 */
const isDistorting = (node: IProjectionNode) =>
    node !== node.root &&
    Boolean(hasNonAxisAlignedTransform(node.latestValues) || node.quad?.active)

const hasRotatedAncestor = (node: IProjectionNode) =>
    node.path.some(isDistorting)

const sourceOf = (node: IProjectionNode) =>
    node.resumeFrom || node.resumingFrom || node

/**
 * The box engine measures every tracked node with its rotations and skews
 * reset, and the DOM reapplies them on top of its boxes. That's exact for
 * a shared element if every distorting ancestor on either side is common to
 * both, or animates from the other side's matching ancestor, so it starts
 * at the rotation the snapshot was drawn with. Otherwise the element would
 * start in the wrong place.
 */
function boxCanHandOver(lead: IProjectionNode, prev: IProjectionNode) {
    for (const ancestor of lead.path) {
        if (
            isDistorting(ancestor) &&
            !prev.path.includes(ancestor) &&
            !prev.path.includes(sourceOf(ancestor))
        ) {
            return false
        }
    }

    for (const ancestor of prev.path) {
        if (
            isDistorting(ancestor) &&
            !lead.path.some((node) => sourceOf(node) === ancestor)
        ) {
            return false
        }
    }

    return true
}

/**
 * Whether `node` is drawn in a space a box can't describe.
 */
const isInQuadSpace = (node: IProjectionNode) =>
    Boolean(node.layout?.quad?.isQuadSpace || node.quad?.active)

/**
 * Measure the space a node is drawn in, alongside its box. Only called
 * where the renderer can measure spaces. Returns undefined, the common
 * case, if a box describes the node.
 */
export function measureQuad<I>(
    node: IProjectionNode<I>,
    isSnapshot: boolean,
    layoutBox: Box,
    measureSpace: MeasureSpace<I>,
    scroll?: Point
): QuadMeasurements | undefined {
    const { instance, parent } = node
    if (!instance) return undefined

    const inherited = Boolean(parent && isInQuadSpace(parent))

    let isQuadSpace = false
    const measured = measureSpace(instance, parent, space, inherited)

    if (measured) {
        isQuadSpace =
            inherited ||
            !isAxisAligned(space.env) ||
            Boolean(space.perspective[0] && has3DTransform(node.latestValues))
    }

    /**
     * A shared element that's rotated, or under rotated ancestors, still
     * needs its visible corners, in case the element it hands over to
     * can't start from its box.
     */
    const needsVisual =
        isSnapshot &&
        node.options.layoutId !== undefined &&
        (isDistorting(node) || hasRotatedAncestor(node))

    if (!isQuadSpace && !needsVisual) return undefined

    const quad: QuadMeasurements = {
        rect: createBox(),
        env: createMat3(),
        perspective: new Float64Array(3),
        isQuadSpace,
    }

    if (isQuadSpace) {
        copyBoxInto(quad.rect, space.rect)
        quad.env.set(space.env)
        quad.perspective.set(space.perspective)

        if (scroll) {
            const { x, y } = scroll
            quad.rect.x.min += x
            quad.rect.x.max += x
            quad.rect.y.min += y
            quad.rect.y.max += y
            conjugateTranslate(quad.env, quad.env, x, y)
            quad.perspective[1] += x
            quad.perspective[2] += y
        }
    } else {
        copyBoxInto(quad.rect, layoutBox)
    }

    if (isSnapshot) {
        quad.visual = createQuad()
        if (parent) {
            getVisual(parent, snapshotSpace)
        } else {
            identity(snapshotSpace)
        }
        multiply(snapshotSpace, snapshotSpace, quad.env)

        /**
         * A projecting node's transform applies to the layout it was
         * projected from, not the box just measured, which includes it.
         */
        const rect = node.quad?.active
            ? node.quad.rect
            : isBoxProjecting(node)
            ? layoutRect(node)!
            : quad.rect

        renderedTransform(node, rendered, rect, quad.perspective)
        multiply(snapshotSpace, snapshotSpace, rendered)
        transformBoxToQuad(quad.visual, snapshotSpace, rect)
    }

    return quad
}

const snapshotSpace = /* @__PURE__ */ createMat3()
const rendered = /* @__PURE__ */ createMat3()

const layoutRect = (node: IProjectionNode) =>
    node.layout &&
    (node.layout.quad ? node.layout.quad.rect : node.layout.layoutBox)

const isBoxProjecting = (node: IProjectionNode) =>
    Boolean(node.projectionDelta && node.getLead().target && node.layout)

/**
 * The transform a node is currently rendering, as a page-space homography,
 * from its state rather than the DOM. During snapshots, rotations in the
 * DOM are briefly reset, so this is the only reliable source.
 */
export function renderedTransform(
    node: IProjectionNode,
    out: Mat3,
    rect = layoutRect(node),
    perspective = node.layout?.quad?.perspective
): Mat3 {
    const { quad } = node
    if (quad && quad.active) return copyMat3(out, quad.output)

    if (!rect) return identity(out)

    if (isBoxProjecting(node)) {
        const lead = node.getLead()
        node.applyTransformsToTarget()
        const delta = node.projectionDeltaWithTransform!
        const { x, y } = node.projectionDelta!
        const treeScale = node.treeScale!
        return projectionToHomography(
            out,
            delta.x.translate,
            delta.y.translate,
            delta.x.scale,
            delta.y.scale,
            treeScale.x,
            treeScale.y,
            rect.x.min + x.origin * (rect.x.max - rect.x.min),
            rect.y.min + y.origin * (rect.y.max - rect.y.min),
            lead.animationValues || lead.latestValues
        )
    }

    return valuesToHomography(
        out,
        node.latestValues,
        rect.x.min,
        rect.y.min,
        rect.x.max - rect.x.min,
        rect.y.max - rect.y.min,
        perspective
    )
}

/**
 * The space a node is drawn in: its parent's visual transform, then the
 * environment between them.
 */
export function getSpace(node: IProjectionNode, out: Mat3): Mat3 {
    node.parent ? getVisual(node.parent, out) : identity(out)
    const env = node.layout?.quad?.env
    return env ? multiply(out, out, env) : out
}

const visualRendered = /* @__PURE__ */ createMat3()

/**
 * How a node currently maps from its layout to the page.
 */
export function getVisual(node: IProjectionNode, out: Mat3): Mat3 {
    if (!node.parent) return identity(out)
    getSpace(node, out)
    return multiply(out, out, renderedTransform(node, visualRendered))
}

const numericRotation = (values: ResolvedValues) =>
    ((values.rotate as number) || 0) + ((values.rotateZ as number) || 0)

/**
 * Decide whether a starting layout animation needs quad projection, and if
 * so prepare it. Called once per animation.
 */
export function startQuadAnimation(
    node: IProjectionNode,
    snapshot: Measurements | undefined,
    isShared: boolean
): boolean {
    const { layout, parent } = node
    const snapshotQuad = snapshot?.quad

    const prev = node.resumeFrom || node.resumingFrom

    const engage =
        layout &&
        snapshot &&
        (layout.quad?.isQuadSpace ||
            snapshotQuad?.isQuadSpace ||
            (parent && parent.quad?.active) ||
            (isShared && prev && !boxCanHandOver(node, prev)))

    if (!engage) {
        if (node.quad) node.quad.active = false
        return false
    }

    const quad = (node.quad ||= createQuadProjection())
    quad.active = true
    quad.resolved = false
    quad.progress = 0

    if (snapshotQuad?.visual) {
        copyQuad(quad.origin, snapshotQuad.visual)
    } else {
        quadFromBox(quad.origin, snapshot.measuredBox)
    }

    copyBoxInto(quad.rect, layoutRect(node)!)

    quad.turns = isShared
        ? numericRotation(node.latestValues) -
          numericRotation(snapshot.latestValues)
        : 0

    return true
}

const TAU = Math.PI * 2
const live = /* @__PURE__ */ createMat3()
const inverse = /* @__PURE__ */ createMat3()
const start = /* @__PURE__ */ createMat3()

/**
 * Per frame: mix the lead's start and live components into its own
 * transform.
 */
export function calcQuadLead(node: IProjectionNode) {
    const quad = node.quad!
    const { rect, from, to, mixed } = quad
    const cx = (rect.x.min + rect.x.max) / 2
    const cy = (rect.y.min + rect.y.max) / 2

    getSpace(node, quad.space)

    /**
     * The lead's own transforms, read live so the animation always lands
     * on them, even if they change while it plays.
     */
    const previousRotation = to[2]
    const { width, height } = size(rect)
    valuesToHomography(
        live,
        node.latestValues,
        rect.x.min,
        rect.y.min,
        width,
        height,
        node.layout?.quad?.perspective
    )
    decompose(to, live, cx, cy)

    if (!quad.resolved) {
        /**
         * Pull the snapshot's corners back into the lead's space. Resolving
         * here, on the first frame, rather than when the animation starts,
         * keeps the start pinned to the snapshot even if the space moves
         * before the animation starts.
         */
        if (
            !invert(inverse, quad.space) ||
            !transformQuad(quad.local, inverse, quad.origin) ||
            !boxToQuad(start, rect, quad.local) ||
            !decompose(from, start, cx, cy)
        ) {
            from.set(to)
        }

        unwrapRotation(from, to[2])
        if (quad.turns) {
            const shortest = to[2] - from[2]
            from[2] -=
                Math.round(((quad.turns * Math.PI) / 180 - shortest) / TAU) *
                TAU
        }
        quad.resolved = true
    } else {
        unwrapRotation(to, previousRotation)
    }

    mixComponents(mixed, from, to, quad.progress)
    constrain(mixed, to, node.options.animationType, from)

    compose(quad.output, mixed, cx, cy)
    multiply(quad.visual, quad.space, quad.output)
}

/**
 * Hold the components `animationType` doesn't animate at their target.
 */
function constrain(
    mixed: HomographyComponents,
    to: HomographyComponents,
    animationType: string | undefined,
    from: HomographyComponents
) {
    switch (animationType) {
        case "position":
            for (let i = 2; i < 8; i++) mixed[i] = to[i]
            break
        case "size":
            mixed[0] = to[0]
            mixed[1] = to[1]
            break
        case "x":
            mixed[1] = to[1]
            mixed[4] = to[4]
            break
        case "y":
            mixed[0] = to[0]
            mixed[3] = to[3]
            break
        case "preserve-aspect":
            if (Math.abs(from[3] / from[4] - to[3] / to[4]) > 0.2) {
                constrain(mixed, to, "position", from)
            }
            break
    }
}

const fit = /* @__PURE__ */ createMat3()

/**
 * Per frame, after every lead: project a follow node onto its lead's quad.
 */
export function calcQuadFollow(node: IProjectionNode) {
    const lead = node.getLead()
    const leadQuad = lead.quad
    if (lead === node || !leadQuad?.active || !leadQuad.resolved) return

    const rect = layoutRect(node)
    if (!rect) return

    const quad = (node.quad ||= createQuadProjection())
    copyBoxInto(quad.rect, rect)
    getSpace(node, quad.space)

    if (!invert(inverse, quad.space)) return

    const from = size(rect)
    const fromWidth = from.width
    const fromHeight = from.height
    const to = size(leadQuad.rect)
    rectToRect(
        fit,
        rect.x.min,
        rect.y.min,
        fromWidth,
        fromHeight,
        leadQuad.rect.x.min,
        leadQuad.rect.y.min,
        to.width,
        to.height
    )

    multiply(quad.output, leadQuad.visual, fit)
    multiply(quad.output, inverse, quad.output)
    copyMat3(quad.visual, leadQuad.visual)
    quad.mixed.set(leadQuad.mixed)
    quad.mixed[3] *= to.width / fromWidth
    quad.mixed[4] *= to.height / fromHeight
    quad.active = true
    node.scheduleRender(false)
}

const dimensions = { width: 0, height: 0 }

function size({ x, y }: Box) {
    dimensions.width = x.max - x.min
    dimensions.height = y.max - y.min
    return dimensions
}

export function stopQuadProjection(node: IProjectionNode) {
    if (node.quad) node.quad.active = false
    const stack = node.getStack()
    if (stack) {
        for (const member of stack.members) {
            if (member.quad) member.quad.active = false
        }
    }
}

const css = /* @__PURE__ */ createMat3()

/**
 * The CSS transform for a node's quad projection, about `origin` (0-1 of
 * its box), with the stand-in node its scale correctors should read.
 */
export function quadTransform(
    node: IProjectionNode,
    originX: number,
    originY: number
): string {
    const { output, rect, mixed, correction } = node.quad!
    const { width, height } = size(rect)
    const x = rect.x.min + originX * width
    const y = rect.y.min + originY * height

    /**
     * `output` acts on page coordinates. CSS applies it in the element's
     * own, from its transform-origin.
     */
    conjugateTranslate(css, output, -x, -y)

    /**
     * Visible size, as scale correctors expect from a projected node.
     */
    const scaleX = Math.abs(mixed[3])
    const scaleY = Math.abs(mixed[4])
    correction.target.x.max = width * scaleX
    correction.target.y.max = height * scaleY
    correction.projectionDelta.x.scale = scaleX
    correction.projectionDelta.y.scale = scaleY

    return toMatrix3d(css)
}
