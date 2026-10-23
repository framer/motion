import type { Box } from "motion-utils"
import { identity, Mat3, multiply } from "./mat3"

/**
 * The space an element is drawn in, as measured from the DOM.
 */
export interface SpaceMeasurement {
    /**
     * The element's border box in the viewport with every transform above
     * it, and its own, removed.
     */
    rect: Box

    /**
     * Transforms Motion doesn't control, between the element's projection
     * parent and the element, as a viewport-space homography. This includes
     * CSS `transform`, `translate`, `rotate` and `scale`, and `perspective`
     * on their parents.
     */
    env: Mat3

    /**
     * `perspective` on the element's parent, which applies to its own
     * transform, and its origin in the viewport. Distance 0 if none.
     */
    perspective: Float64Array
}

interface Layer {
    element: Element
    transform?: string
    origin?: string
    /**
     * The element's parent has `perspective`, which applies to this
     * element's transform.
     */
    perspective?: Element
}

const parentOf = (element: Element): Element | null =>
    element.parentElement ||
    ((element.parentNode as ShadowRoot | null)?.host ?? null)

/**
 * The element's transform as one CSS transform list: the individual
 * `translate`, `rotate` and `scale` properties, then `transform`.
 */
function readTransform(style: CSSStyleDeclaration): string | undefined {
    let list = ""
    const { translate, rotate, scale, transform } = style

    if (translate && translate !== "none") {
        const [x, y = "0px", z = "0px"] = translate.split(" ")
        list += `translate3d(${x}, ${y}, ${z}) `
    }

    if (rotate && rotate !== "none") {
        const parts = rotate.split(" ")
        if (parts.length === 1) {
            list += `rotate(${parts[0]}) `
        } else if (parts.length === 2) {
            list += `rotate${parts[0].toUpperCase()}(${parts[1]}) `
        } else {
            list += `rotate3d(${parts.join(", ")}) `
        }
    }

    if (scale && scale !== "none") {
        const [x, y = x, z = "1"] = scale.split(" ")
        list += `scale3d(${x}, ${y}, ${z}) `
    }

    if (transform && transform !== "none") list += transform

    return list || undefined
}

/**
 * Parse a CSS length list like "10px 20px 0px" into px numbers.
 */
function readOrigin(origin: string, out: number[]) {
    const parts = origin.split(" ")
    out[0] = parseFloat(parts[0]) || 0
    out[1] = parseFloat(parts[1]) || 0
    out[2] = parseFloat(parts[2]) || 0
    return out
}

const origin: number[] = [0, 0, 0]

/**
 * A row-major 4x4 from a DOMMatrix, which lists columns.
 */
function fromDOMMatrix(m: DOMMatrix, out: Float64Array) {
    out[0] = m.m11
    out[1] = m.m21
    out[2] = m.m31
    out[3] = m.m41
    out[4] = m.m12
    out[5] = m.m22
    out[6] = m.m32
    out[7] = m.m42
    out[8] = m.m13
    out[9] = m.m23
    out[10] = m.m33
    out[11] = m.m43
    out[12] = m.m14
    out[13] = m.m24
    out[14] = m.m34
    out[15] = m.m44
    return out
}

/**
 * `m = T(x, y, z) * m * T(-x, -y, -z)`
 */
function moveOrigin(m: Float64Array, x: number, y: number, z: number) {
    for (let r = 0; r < 16; r += 4) {
        m[r + 3] -= m[r] * x + m[r + 1] * y + m[r + 2] * z
    }
    for (let c = 0; c < 4; c++) {
        const w = m[12 + c]
        m[c] += x * w
        m[4 + c] += y * w
        m[8 + c] += z * w
    }
}

function multiply4(out: Float64Array, a: Float64Array, b: Float64Array) {
    const result = new Float64Array(16)
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            let sum = 0
            for (let k = 0; k < 4; k++) sum += a[r * 4 + k] * b[k * 4 + c]
            result[r * 4 + c] = sum
        }
    }
    out.set(result)
    return out
}

/**
 * The homography a 4x4 applies to the z = 0 plane.
 */
function reduce(m: Float64Array, out: Mat3) {
    out[0] = m[0]
    out[1] = m[1]
    out[2] = m[3]
    out[3] = m[4]
    out[4] = m[5]
    out[5] = m[7]
    out[6] = m[12]
    out[7] = m[13]
    out[8] = m[15]
    return out
}

function perspectiveMatrix(
    parent: Element,
    rect: DOMRect,
    out: Float64Array
): Float64Array {
    const style = getComputedStyle(parent)
    out.fill(0)
    out[0] = out[5] = out[10] = out[15] = 1
    out[14] = -1 / parseFloat(style.perspective)
    readOrigin(style.perspectiveOrigin, origin)
    moveOrigin(out, rect.left + origin[0], rect.top + origin[1], 0)
    return out
}

const hasPerspective = (element: Element) => {
    const { perspective } = getComputedStyle(element)
    return Boolean(perspective) && perspective !== "none"
}

interface SavedTransform {
    element: HTMLElement | SVGElement
    transform: string
    translate: string
    rotate: string
    scale: string
}

/**
 * Temporarily replace transforms with an identity. Not `none`, so a
 * transformed element stays the containing block for its fixed and
 * absolute descendants, and layout doesn't change.
 */
function neutralise(element: Element, saved: SavedTransform[]) {
    const { style } = element as HTMLElement
    if (!style) return
    saved.push({
        element: element as HTMLElement,
        transform: style.transform,
        translate: style.translate,
        rotate: style.rotate,
        scale: style.scale,
    })
    style.transform = "translate(0px)"
    style.translate = style.rotate = style.scale = "none"
}

function restore(saved: SavedTransform[]) {
    for (let i = saved.length - 1; i >= 0; i--) {
        const { element, transform, translate, rotate, scale } = saved[i]
        const { style } = element
        style.transform = transform
        style.translate = translate
        style.rotate = rotate
        style.scale = scale
    }
}

/**
 * Measure the space `element` is drawn in, between it and `until` (its
 * projection parent, or null for the document).
 *
 * Returns false, without writing to the DOM, if no transform or
 * perspective lies between them and `force` is false. Otherwise every
 * transform from the element up to the document is briefly neutralised to
 * read untransformed boxes, then restored.
 */
export function measureSpace(
    element: Element,
    until: Element | null,
    out: SpaceMeasurement,
    force = false
): boolean {
    if (typeof DOMMatrix === "undefined") return false

    /**
     * Layers between the element and its projection parent, innermost
     * first.
     */
    const layers: Layer[] = []
    let parent = parentOf(element)
    let found = false

    const perspectiveParent = Boolean(parent && hasPerspective(parent))

    while (parent && parent !== until) {
        const style = getComputedStyle(parent)
        const transform = readTransform(style)
        const layer: Layer = { element: parent }

        if (transform) {
            layer.transform = transform
            layer.origin = style.transformOrigin
            found = true

            const grandparent = parentOf(parent)
            if (grandparent && hasPerspective(grandparent)) {
                layer.perspective = grandparent
            }
        }

        layers.push(layer)
        parent = parentOf(parent)
    }

    if (!found && !perspectiveParent && !force) return false

    /**
     * Neutralise every transform from the element up to the document, so
     * boxes measure untransformed.
     */
    const saved: SavedTransform[] = []
    let ancestor: Element | null = element
    while (ancestor) {
        if (readTransform(getComputedStyle(ancestor))) {
            neutralise(ancestor, saved)
        }
        ancestor = parentOf(ancestor)
    }

    const rect = element.getBoundingClientRect()
    const layerRects = layers.map((layer) =>
        layer.transform ? layer.element.getBoundingClientRect() : undefined
    )
    const perspectiveRects = layers.map((layer) =>
        layer.perspective
            ? layer.perspective.getBoundingClientRect()
            : undefined
    )
    const elementParent = parentOf(element)
    const parentRect =
        perspectiveParent && elementParent
            ? elementParent.getBoundingClientRect()
            : undefined

    restore(saved)

    out.rect.x.min = rect.left
    out.rect.x.max = rect.right
    out.rect.y.min = rect.top
    out.rect.y.max = rect.bottom

    /**
     * Compose layers outermost first.
     */
    identity(out.env)
    const m = new Float64Array(16)
    const p = new Float64Array(16)
    const h = new Float64Array(9)
    for (let i = layers.length - 1; i >= 0; i--) {
        const layer = layers[i]
        if (!layer.transform) continue

        const layerRect = layerRects[i]!
        fromDOMMatrix(new DOMMatrix(layer.transform), m)
        readOrigin(layer.origin!, origin)
        moveOrigin(
            m,
            layerRect.left + origin[0],
            layerRect.top + origin[1],
            origin[2]
        )

        if (layer.perspective) {
            perspectiveMatrix(layer.perspective, perspectiveRects[i]!, p)
            multiply4(m, p, m)
        }

        multiply(out.env, out.env, reduce(m, h))
    }

    const perspective = out.perspective
    perspective[0] = 0
    if (parentRect && elementParent) {
        const style = getComputedStyle(elementParent)
        perspective[0] = parseFloat(style.perspective)
        readOrigin(style.perspectiveOrigin, origin)
        perspective[1] = parentRect.left + origin[0]
        perspective[2] = parentRect.top + origin[1]
    }

    return true
}
