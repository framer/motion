import * as React from "react"
import { useContext, forwardRef, ComponentType, Ref } from "react"
import { useExternalRef } from "./utils/use-external-ref"
import { useMotionValues, MountMotionValues } from "./utils/use-motion-values"
import { useMotionStyles } from "./utils/use-styles"
import { useComponentAnimationControls } from "../animation/use-animation-controls"
import { MotionContext, useMotionContext } from "./context/MotionContext"
import { MotionProps } from "./types"
import { GetFunctionalityComponents } from "./functionality/types"
import { checkShouldInheritVariant } from "./utils/should-inherit-variant"
import { getAnimateComponent } from "./functionality/animation"

export interface MotionComponentConfig {
    useFunctionalityComponents: GetFunctionalityComponents
}

/**
 * @internal
 */
export const createMotionComponent = <P extends {}>({
    useFunctionalityComponents,
}: MotionComponentConfig) => {
    function MotionComponent(
        props: P & MotionProps,
        externalRef?: Ref<Element>
    ) {
        const ref = useExternalRef(externalRef)
        const parentContext = useContext(MotionContext)
        const isStatic = parentContext.static || props.static || false
        const values = useMotionValues(props, isStatic)
        const style = useMotionStyles(
            values,
            props.style,
            props.transformValues
        )
        const shouldInheritVariant = checkShouldInheritVariant(props)
        const controls = useComponentAnimationControls(
            values,
            props,
            ref,
            shouldInheritVariant
        )
        const context = useMotionContext(
            parentContext,
            controls,
            isStatic,
            props.initial
        )

        // Add functionality
        const Animate = getAnimateComponent(props, context.static)

        const handleAnimate = Animate && (
            <Animate
                {...props}
                inherit={shouldInheritVariant}
                innerRef={ref}
                values={values}
                controls={controls}
            />
        )

        const handleActiveFunctionality = useFunctionalityComponents(
            props,
            values,
            controls,
            ref,
            style,
            context.static
        )

        return (
            <MotionContext.Provider value={context}>
                <MountMotionValues ref={ref} values={values} />
                {handleAnimate}
                {handleActiveFunctionality}
            </MotionContext.Provider>
        )
    }

    return forwardRef(MotionComponent)
}
