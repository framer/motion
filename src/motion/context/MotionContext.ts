import { createContext, useContext, useMemo } from "react"
import { VisualElement } from "../../render/types"
import {
    checkIfControllingVariants,
    isVariantLabel,
} from "../../render/utils/variants"
import { MotionProps } from "../types"

export interface MotionContextProps {
    visualElement?: VisualElement
    initial?: false | string | string[]
    animate?: string | string[]
}

export const MotionContext = createContext<MotionContextProps>({})

export function useVisualElementContext() {
    return useContext(MotionContext).visualElement
}

export function getCurrentTreeVariants(
    props: MotionProps,
    context: MotionContextProps
): MotionContextProps {
    if (checkIfControllingVariants(props)) {
        const { initial, animate } = props
        return {
            initial:
                initial === false || isVariantLabel(initial)
                    ? (initial as any)
                    : undefined,
            animate: isVariantLabel(animate) ? animate : undefined,
        }
    }
    return props.inherit !== false ? context : {}
}

function variantLabelsAsDependency(
    prop: undefined | string | string[] | boolean
) {
    return Array.isArray(prop) ? prop.join(" ") : prop
}

export function useCreateMotionContext(
    props: MotionProps,
    isStatic: boolean
): MotionContextProps {
    const { initial, animate } = getCurrentTreeVariants(
        props,
        useContext(MotionContext)
    )

    return useMemo(
        () => ({ initial, animate }),
        isStatic
            ? [
                  variantLabelsAsDependency(initial),
                  variantLabelsAsDependency(animate),
              ]
            : []
    )
}
