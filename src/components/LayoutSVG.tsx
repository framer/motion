import * as React from "react"
import { useEffect } from "react"
import { motion } from "../render/dom/motion"
import { MotionProps } from "../motion/types"
import { SVGMotionProps, UnwrapSVGFactoryElement } from "../render/svg/types"
import { useMotionValue } from "../value/use-motion-value"
import { useVisualElementContext } from "../context/MotionContext"
import { MotionValue } from "../value"
import { Box } from "../projection/geometry/types"
import { calcLength } from "../projection/geometry/delta-calc"

export type SVGProps = SVGMotionProps<UnwrapSVGFactoryElement<"svg">>

export interface LayoutSVGProps extends MotionProps, SVGProps {}

export interface ViewBoxProps {
    viewBox: MotionValue<string | undefined>
}

export function LayoutSVGComponent(
    { children, ...props }: LayoutSVGProps,
    ref: React.Ref<SVGSVGElement>
) {
    const viewBox = useMotionValue<string>(props.viewBox as string)

    return (
        <motion.svg
            ref={ref}
            {...props}
            viewBox={viewBox}
            layout
            preserveAspectRatio="none"
        >
            <ProjectViewBox viewBox={viewBox} />
            {children}
        </motion.svg>
    )
}

function ProjectViewBox({ viewBox }: ViewBoxProps) {
    const svgVisualElement = useVisualElementContext()
    useEffect(() => {
        return svgVisualElement?.projection?.addEventListener(
            "projectionUpdate",
            ({ x, y }: Box) => {
                // TODO: A reveal option could be added where 0 0 is
                // x.min, y.min
                // viewBox.set(`0 0 ${calcLength(x)} ${calcLength(y)}`)
                viewBox.set(
                    `${x.min} ${y.min} ${calcLength(x)} ${calcLength(y)}`
                )
            }
        )
    }, [svgVisualElement])

    return null
}

export const LayoutSVG = React.forwardRef(LayoutSVGComponent)
