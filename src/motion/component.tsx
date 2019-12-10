import * as React from "react"
import { useContext, forwardRef, Ref, RefObject } from "react"
import { useMotionValues, MotionValuesMap } from "./utils/use-motion-values"
import { Mount } from "./utils/Mount"
import { useMotionStyles } from "./utils/use-styles"
import { useValueAnimationControls } from "../animation/use-value-animation-controls"
import { MotionContext, useMotionContext } from "./context/MotionContext"
import { MotionProps } from "./types"
import {
    LoadFunctionalityComponents,
    RenderComponent,
} from "./functionality/types"
import { checkShouldInheritVariant } from "./utils/should-inherit-variant"
import { ValueAnimationConfig } from "../animation/ValueAnimationControls"
import { useConstant } from "../utils/use-constant"
import { useExternalRef } from "./utils/use-external-ref"
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
        const parentContext = useContext(MotionContext)

        const isStatic = parentContext.static || props.static || false
        const values = useMotionValues(props)
        const style = useMotionStyles(
            values,
            props.style,
            isStatic,
            props.transformValues
        )
        const shouldInheritVariant = checkShouldInheritVariant(props)

        const controlsConfig = useConstant(() => {
            return getValueControlsConfig(ref, values)
        })
        const controls = useValueAnimationControls(
            controlsConfig,
            props,
            shouldInheritVariant,
            parentContext
        )

        const context = useMotionContext(
            parentContext,
            controls,
            values,
            isStatic,
            props
        )

        const functionality = isStatic
            ? null
            : loadFunctionalityComponents(
                  ref,
                  values,
                  props,
                  parentContext,
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
                <MotionContext.Provider value={context}>
                    {renderedComponent}
                </MotionContext.Provider>
                <>
                    <Mount innerRef={ref} values={values} isStatic={isStatic} />
                    {functionality}
                </>
            </>
        )
    }

    return forwardRef(MotionComponent)
}
