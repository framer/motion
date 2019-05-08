import * as React from "react"
import { useContext, useMemo, forwardRef, Ref } from "react"
import { useExternalRef } from "./utils/use-external-ref"
import { useMotionValues, MountMotionValues } from "./utils/use-motion-values"
import { useMotionStyles } from "./utils/use-styles"
import { useValueAnimationControls } from "../animation/use-value-animation-controls"
import { MotionContext, useMotionContext } from "./context/MotionContext"
import { MotionProps } from "./types"
import { UseFunctionalityComponents } from "./functionality/types"
import { checkShouldInheritVariant } from "./utils/should-inherit-variant"
import { getAnimateComponent } from "./functionality/animation"
import styler from "stylefire"
import { parseDomVariant } from "../dom/parse-dom-variant"
import { ValueAnimationConfig } from "animation/ValueAnimationControls"
export { MotionProps }

export interface MotionComponentConfig {
    useFunctionalityComponents: UseFunctionalityComponents
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

        const controlsConfig = useMemo(
            (): ValueAnimationConfig => ({
                values,
                readValueFromSource: key =>
                    styler(ref.current as Element).get(key),
                makeTargetAnimatable: parseDomVariant(values, ref),
            }),
            []
        )
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
                <MountMotionValues ref={ref} values={values} />
                {handleAnimate}
                {handleActiveFunctionality}
            </MotionContext.Provider>
        )
    }

    return forwardRef(MotionComponent)
}
