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
    LoadFunctionalityComponents,
    RenderComponent,
} from "./functionality/types"
import { applyExitProps } from "./utils/apply-exit-props"
import { checkShouldInheritVariant } from "./utils/should-inherit-variant"
import { ValueAnimationConfig } from "../animation/ValueAnimationControls"
import { useConstant } from "../utils/use-constant"
export { MotionProps }

export interface MotionComponentConfig {
    loadFunctionalityComponents: LoadFunctionalityComponents
    renderComponent: RenderComponent
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
    loadFunctionalityComponents,
    renderComponent,
}: MotionComponentConfig) => {
    function MotionComponent(
        props: P & MotionProps,
        externalRef?: Ref<Element>
    ) {
        const ref = useExternalRef(externalRef)
        const { exitProps, ...parentContext } = useContext(MotionContext)

        if (exitProps) {
            props = applyExitProps(props, exitProps)
        }

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

        const functionality = isStatic
            ? null
            : loadFunctionalityComponents(
                  ref,
                  values,
                  props,
                  controls,
                  shouldInheritVariant
              )

        const renderedComponent = renderComponent(
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
                    {renderedComponent}
                </MotionContext.Provider>
            </>
        )
    }

    return forwardRef(MotionComponent)
}
