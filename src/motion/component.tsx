import * as React from "react"
import { useContext, forwardRef, Ref, RefObject } from "react"
import { useExternalRef } from "./utils/use-external-ref"
import {
    useMotionValues,
    MountMotionValues,
    MotionValuesMap,
} from "./utils/use-motion-values"
import { useMotionStyles } from "./utils/use-styles"
import { useValueAnimationControls } from "../animation/use-value-animation-controls"
import { MotionContext, useMotionContext } from "./context/MotionContext"
import { MotionProps } from "./types"
import { UseFunctionalityComponents } from "./functionality/types"
import { checkShouldInheritVariant } from "./utils/should-inherit-variant"
import { getAnimateComponent } from "./functionality/animation"
import { ValueAnimationConfig } from "../animation/ValueAnimationControls"
import { useConstant } from "../utils/use-constant"
export { MotionProps }

export interface MotionComponentConfig {
    useFunctionalityComponents: UseFunctionalityComponents
    getValueControlsConfig: (
        ref: RefObject<any>,
        values: MotionValuesMap
    ) => ValueAnimationConfig
}

/**
 * @internal
 */
export const createMotionComponent = <P extends {}>({
    useFunctionalityComponents,
    getValueControlsConfig,
}: MotionComponentConfig) => {
    function MotionComponent(
        props: P & MotionProps,
        externalRef?: Ref<Element>
    ) {
        const ref = useExternalRef(externalRef)
        const parentContext = useContext(MotionContext)
        const isStatic = parentContext.static || props.static || false
        const values = useMotionValues(props)
        const style = useMotionStyles(
            values,
            props.style,
            props.transformValues
        )
        const shouldInheritVariant = checkShouldInheritVariant(props)

        const controlsConfig = useConstant(() => {
            return getValueControlsConfig(ref, values)
        })
        const controls = useValueAnimationControls(
            controlsConfig,
            props,
            shouldInheritVariant
        )
        const context = useMotionContext(
            parentContext,
            controls,
            isStatic,
            props
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
                <MountMotionValues
                    ref={ref}
                    values={values}
                    isStatic={isStatic}
                />
                {handleAnimate}
                {handleActiveFunctionality}
            </MotionContext.Provider>
        )
    }

    return forwardRef(MotionComponent)
}
