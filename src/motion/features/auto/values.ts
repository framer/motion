import { MotionStyle } from "../../types"
import { mix, mixColor } from "@popmotion/popcorn"
import { BoxDelta, BoxShadow } from "./types"
import { complex, px } from "style-value-types"
import { AxisBox2D, Axis } from "../../../types/geometry"
import { VisualElement } from "../../../render/VisualElement"

type Read = (computedStyle: string) => string | number

type Updater = (p: number) => void

/**
 * @public
 */
export interface AutoValueHandler {
    read?: Read | false
    reset?: (style: MotionStyle) => any
    // TODO: Seperate the interpolator from the correction
    // And save the former to current automatically
    createUpdater?: (
        visualElement: VisualElement,
        origin: string | number,
        target: string | number,
        current: { [key: string]: string | number | undefined },
        delta: BoxDelta,
        treeScale: { x: number; y: number },
        originBox: AxisBox2D,
        targetBox: AxisBox2D
    ) => Updater | void
}

/**
 * @public
 */
export type AutoValueHandlers = { [key: string]: AutoValueHandler }

function convertSingleRadius(value: string, axis: Axis) {
    const parsed = parseFloat(value)

    if (px.test(value)) {
        return parsed
    } else {
        const factor = parsed / 100
        return factor * (axis.max - axis.min)
    }
}

export function radiusAsPixels(
    value: string,
    box: AxisBox2D
): { x: number; y: number } {
    const [x, y] = value.split(" ")

    return {
        x: convertSingleRadius(x, box.x),
        y: convertSingleRadius(y || x, box.y),
    }
}

const singleBorderRadius = (key: string): AutoValueHandler => ({
    reset: style => {
        return style.borderRadius !== undefined ? style.borderRadius : ""
    },
    createUpdater: (
        visualElement,
        origin: string,
        target: string,
        current,
        delta,
        treeScale,
        originBox,
        targetBox
    ) => {
        if (!origin && !target) return

        const motionValue = visualElement.getValue(key, "")

        const originAsPixels = radiusAsPixels(origin, originBox)
        const targetAsPixels = radiusAsPixels(target, targetBox)

        return p => {
            const vx = mix(originAsPixels.x, targetAsPixels.x, p)
            const vy = mix(originAsPixels.y, targetAsPixels.y, p)

            current[key] = `${vx}px ${vy}px`

            const targetX = vx / delta.x.scale / treeScale.x
            const targetY = vy / delta.y.scale / treeScale.y

            // Perform the animation in pixels but if we don't need correction just set
            // to the target so percentages have an affect going forward
            const latest =
                p === 1 &&
                delta.x.scale / treeScale.x / delta.y.scale / treeScale.y === 1
                    ? target
                    : `${targetX}px ${targetY}px`

            motionValue.set(latest)
        }
    },
})

export const defaultMagicValues: AutoValueHandlers = {
    backgroundColor: {
        reset: style => {
            return style.background !== undefined ? style.background : ""
        },
    },
    borderRadius: {
        read: false,
    },
    borderTopLeftRadius: singleBorderRadius("borderTopLeftRadius"),
    borderTopRightRadius: singleBorderRadius("borderTopRightRadius"),
    borderBottomLeftRadius: singleBorderRadius("borderBottomLeftRadius"),
    borderBottomRightRadius: singleBorderRadius("borderBottomRightRadius"),
    boxShadow: {
        createUpdater: (
            visualElement,
            origin: string,
            target: string,
            current,
            delta,
            treeScale
        ) => {
            if (isEmptyBoxShadow(origin) && isEmptyBoxShadow(target)) {
                return
            }

            const originShadow = getAnimatableShadow(origin, target)
            const targetShadow = getAnimatableShadow(target, origin)

            const currentShadow = [...originShadow] as BoxShadow
            const mixShadowColor = mixColor(originShadow[0], currentShadow[0])

            const shadowTemplate = complex.createTransformer(
                target !== "none" ? target : origin
            ) as (shadow: BoxShadow) => string

            const dx = delta.x
            const dy = delta.y
            const boxShadow = visualElement.getValue("boxShadow", "")

            return p => {
                // Update box shadow
                currentShadow[0] = mixShadowColor(p) // color
                currentShadow[1] = mix(originShadow[1], targetShadow[1], p) // x
                currentShadow[2] = mix(originShadow[2], targetShadow[2], p) // y
                currentShadow[3] = mix(originShadow[3], targetShadow[3], p) // blur
                currentShadow[4] = mix(originShadow[4], targetShadow[4], p) // spread

                // Update prev box shadow before FLIPPing
                current.boxShadow = shadowTemplate(currentShadow)

                // Apply FLIP inversion to physical dimensions. We need to take an average scale for XY to apply
                // to blur and spread, which affect both axis equally.
                currentShadow[1] = currentShadow[1] / dx.scale / treeScale.x
                currentShadow[2] = currentShadow[2] / dy.scale / treeScale.y

                const averageXYScale = mix(dx.scale, dy.scale, 0.5)
                const averageTreeXTScale = mix(treeScale.x, treeScale.y, 0.5)
                currentShadow[3] =
                    currentShadow[3] / averageXYScale / averageTreeXTScale // blur
                currentShadow[4] =
                    currentShadow[4] / averageXYScale / averageTreeXTScale // spread

                boxShadow.set(shadowTemplate(currentShadow))
            }
        },
    },
    color: {},
    opacity: {
        read: opacity => (opacity !== null ? parseFloat(opacity) : 0),
    },
    // TODO: When experiementing with this to pop AnimatePresence
    // children out of the flow *ensure* it gets set back correctly
    //position: {},
}

function getAnimatableShadow(shadow: string, fallback: string) {
    if (shadow === "none") {
        shadow = complex.getAnimatableNone(fallback)
    }

    return complex.parse(shadow) as BoxShadow
}

function isEmptyBoxShadow(shadow: string) {
    return !shadow || shadow === "none"
}
