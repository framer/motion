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
import {
    UseFunctionalityComponents,
    UseRenderComponent,
} from "./functionality/types"
import { checkShouldInheritVariant } from "./utils/should-inherit-variant"
import { ValueAnimationConfig } from "../animation/ValueAnimationControls"
import { useConstant } from "../utils/use-constant"
export { MotionProps }

export interface MotionComponentConfig {
    useFunctionalityComponents: UseFunctionalityComponents
    useRenderComponent: UseRenderComponent
    getValueControlsConfig: (
        ref: RefObject<any>,
        values: MotionValuesMap
    ) => ValueAnimationConfig
}

/**
 * @internal
 */
export const createMotionComponent = <P extends {}>({
    getValueControlsConfig,
    useFunctionalityComponents,
    useRenderComponent,
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

        const functionality = useFunctionalityComponents(
            ref,
            style,
            values,
            props,
            controls,
            isStatic
        )

        const renderComponent = useRenderComponent(
            ref,
            style,
            values,
            props,
            isStatic
        )

        return (
            <>
                <MountMotionValues
                    ref={ref}
                    values={values}
                    isStatic={isStatic}
                />
                {functionality}
                <MotionContext.Provider value={context}>
                    {renderComponent}
                </MotionContext.Provider>
            </>
        )
    }

    return forwardRef(MotionComponent)
}
