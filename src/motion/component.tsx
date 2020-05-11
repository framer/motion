import * as React from "react"
import { forwardRef, useContext, Ref } from "react"
import { MotionProps } from "./types"
import { MotionSetupContext } from "./context/MotionSetup"

/**
 * @internal
 */
export function createMotionComponent<Props extends {}>(
    Component: string | React.ComponentType<Props>
) {
    function MotionComponent(
        props: Props & MotionProps,
        externalRef?: Ref<Element>
    ) {
        /**
         * Import
         */
        const { renderComponent, renderElement } = useContext(
            MotionSetupContext
        )
        const nativeElement = useNativeElement(externalRef)

        // useStyles

        return renderComponent(Component, props, true)

        // return (
        //     <>
        //         <MotionContext.Provider value={context}>
        //             {render(Component, props, true)}
        //         </MotionContext.Provider>
        //     </>
        // )
    }

    return forwardRef(MotionComponent)
}

// function loadFeatures(availableFeatures: FeatureMap, props: MotionProps) {
//     return []
// }

// export const createMotionComponent = <P extends {}>({
//     getValueControlsConfig,
//     loadFeatures,
//     renderComponent,
// }: MotionComponentConfig) => {
//     function MotionComponent(
//         props: P & MotionProps,
//         externalRef?: Ref<Element>
//     ) {
//         const parentContext = useContext(MotionContext)
//         const isStatic = parentContext.static || props.static || false

//         const values = useMotionValues(props)
//         const style = useMotionStyles(
//             values,
//             props.style,
//             props.transformValues
//         )
//         const shouldInheritVariant = checkShouldInheritVariant(props)

//         const nativeElement = useNativeElement(
//             values,
//             !isStatic,
//             props.allowTransformNone,
//             externalRef
//         )

//         const controlsConfig = useConstant(() => {
//             return getValueControlsConfig(nativeElement, values)
//         })
//         const controls = useValueAnimationControls(
//             controlsConfig,
//             props,
//             shouldInheritVariant
//         )

//         const context = useMotionContext(
//             parentContext,
//             controls,
//             values,
//             isStatic,
//             props
//         )

//         const plugins = useContext(MotionPluginContext)
//         const features = isStatic
//             ? null
//             : loadFeatures(
//                   nativeElement,
//                   values,
//                   props,
//                   context,
//                   parentContext,
//                   controls,
//                   shouldInheritVariant,
//                   plugins
//               )

//         const renderedComponent = renderComponent(
//             nativeElement,
//             style,
//             values,
//             props,
//             isStatic
//         )

//         // The mount order and hierarchy is specific to ensure our element ref is hydrated by the time
//         // all plugins and features has to execute.
//         return (
//             <>
//                 <MotionContext.Provider value={context}>
//                     {renderedComponent}
//                 </MotionContext.Provider>
//                 {features}
//             </>
//         )
//     }

//     return forwardRef(MotionComponent)
// }
