import * as React from "react"
import { useContext, forwardRef, Ref } from "react"
import { useMotionValues, MotionValuesMap } from "./utils/use-motion-values"
import { useMotionStyles } from "./utils/use-styles"
import { useValueAnimationControls } from "../animation/use-value-animation-controls"
import { MotionContext, useMotionContext } from "./context/MotionContext"
import { MotionProps } from "./types"
import { LoadMotionFeatures, RenderComponent } from "./features/types"
import { checkShouldInheritVariant } from "./utils/should-inherit-variant"
import { ValueAnimationConfig } from "../animation/ValueAnimationControls"
import { useConstant } from "../utils/use-constant"
import { useNativeElement, NativeElement } from "./utils/use-native-element"
import { MotionPluginContext } from "./context/MotionPluginContext"
export { MotionProps }

export interface MotionComponentConfig {
    loadFeatures: LoadMotionFeatures
    renderComponent: RenderComponent
    getValueControlsConfig: (
        nativeElement: NativeElement,
        values: MotionValuesMap
    ) => ValueAnimationConfig
}

/**
 * @internal
 */
export const createMotionComponent = <P extends {}>({
    getValueControlsConfig,
    loadFeatures,
    renderComponent,
}: MotionComponentConfig) => {
    function MotionComponent(
        props: P & MotionProps,
        externalRef?: Ref<Element>
    ) {
        const parentContext = useContext(MotionContext)
        const isStatic = parentContext.static || props.static || false

        const values = useMotionValues(props)
        const style = useMotionStyles(
            values,
            props.style,
            props.transformValues
        )
        const shouldInheritVariant = checkShouldInheritVariant(props)

        const nativeElement = useNativeElement(
            values,
            !isStatic,
            props.allowTransformNone,
            externalRef
        )

        const controlsConfig = useConstant(() => {
            return getValueControlsConfig(nativeElement, values)
        })
        const controls = useValueAnimationControls(
            controlsConfig,
            props,
            shouldInheritVariant
        )

        const context = useMotionContext(
            parentContext,
            controls,
            values,
            isStatic,
            props
        )

        const plugins = useContext(MotionPluginContext)
        const features = isStatic
            ? null
            : loadFeatures(
                  nativeElement,
                  values,
                  props,
                  context,
                  parentContext,
                  controls,
                  shouldInheritVariant,
                  plugins
              )

        const renderedComponent = renderComponent(
            nativeElement,
            style,
            values,
            props,
            isStatic
        )

        // The mount order and hierarchy is specific to ensure our element ref is hydrated by the time
        // all plugins and features has to execute.
        return (
            <>
                <MotionContext.Provider value={context}>
                    {renderedComponent}
                </MotionContext.Provider>
                {features}
            </>
        )
    }

    return forwardRef(MotionComponent)
}
