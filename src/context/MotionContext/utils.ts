import { MotionContextProps } from "."
import { MotionProps } from "../../motion/types"
import {
    checkIfControllingVariants,
    isVariantLabel,
} from "../../render/utils/variants"

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
