import { MotionStyle } from "../types"
import { MotionValuesMap } from "../utils/use-motion-values"
import { mix, mixColor } from "@popmotion/popcorn"
import { BoxDelta, BoxShadow } from "./types"
import { complex } from "style-value-types"

type Read = (computedStyle: string) => string | number

type Updater = (p: number) => void

export interface MagicValueHandler {
    read?: Read | false
    reset?: (style: MotionStyle) => any
    // TODO: Seperate the interpolator from the correction
    // And save the former to current automatically
    createUpdater?: (
        values: MotionValuesMap,
        origin: string | number,
        target: string | number,
        current: { [key: string]: string | number | undefined },
        delta: BoxDelta,
        treeScale: { x: number; y: number }
    ) => Updater | void
}

export type MagicValueHandlers = { [key: string]: MagicValueHandler }

const singleBorderRadius = (key: string): MagicValueHandler => ({
    reset: style => {
        return style.borderRadius !== undefined ? style.borderRadius : ""
    },
    read: radius => (radius ? parseFloat(radius) : 0),
    createUpdater: (
        values,
        origin: number,
        target: number,
        current,
        delta,
        treeScale
    ) => {
        if (!origin && !target) return

        const motionValue = values.get(key, "")

        return p => {
            const v = mix(origin, target, p)
            current[key] = v

            const targetX = v / delta.x.scale / treeScale.x
            const targetY = v / delta.y.scale / treeScale.y

            motionValue.set(`${targetX}px ${targetY}px`)
        }
    },
})

export const defaultMagicValues: MagicValueHandlers = {
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
            values,
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
            const boxShadow = values.get("boxShadow", "")

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
