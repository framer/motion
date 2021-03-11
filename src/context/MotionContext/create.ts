import { useContext, useMemo } from "react"
import { MotionContext, MotionContextProps } from "."
import { MotionProps } from "../../motion/types"
import { getCurrentTreeVariants } from "./utils"

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
        /**
         * Only break memoisation in static mode
         */
        isStatic
            ? [
                  variantLabelsAsDependency(initial),
                  variantLabelsAsDependency(animate),
              ]
            : []
    )
}

function variantLabelsAsDependency(
    prop: undefined | string | string[] | boolean
) {
    return Array.isArray(prop) ? prop.join(" ") : prop
}
