import * as React from "react"
import { forwardRef, Ref, ComponentType } from "react"
import { useExternalRef } from "./utils/use-external-ref"
import { useMotionValues, MountMotionValues } from "./utils/use-motion-values"
import { addMotionStyles } from "./utils/style-attr"
import { useComponentAnimationControls } from "../animation/use-animation-controls"
import { MotionContext, useMotionContext } from "./context/MotionContext"
import { MotionProps } from "./types"
import {
    isGesturesEnabled,
    isDragEnabled,
    Gestures,
    Draggable,
    RenderComponent,
    getAnimatePropType,
    getAnimateComponent,
    checkShouldInheritVariant,
} from "./utils/functionality"

/**
 * @internal
 */
export const createMotionComponent = <P extends {}>(
    Component: string | ComponentType<P>
) => {
    function MotionComponent(
        props: P & MotionProps,
        externalRef?: Ref<Element>
    ) {
        const ref = useExternalRef(externalRef)
        const values = useMotionValues(props)
        const style = addMotionStyles(values, props.style)
        const animatePropType = getAnimatePropType(props)
        const shouldInheritVariant = checkShouldInheritVariant(props)
        const controls = useComponentAnimationControls(
            values,
            props,
            ref,
            shouldInheritVariant
        )
        const context = useMotionContext(controls, props.initial)
        // Add functionality
        const Animate = getAnimateComponent(animatePropType)

        const handleAnimate = Animate && (
            <Animate
                {...props}
                inherit={shouldInheritVariant}
                innerRef={ref}
                values={values}
                controls={controls}
            />
        )

        const handleGestures = isGesturesEnabled(props) && (
            <Gestures
                {...props}
                values={values}
                controls={controls}
                innerRef={ref}
            />
        )

        const handleDrag = isDragEnabled(props) && (
            <Draggable
                {...props}
                innerRef={ref}
                controls={controls}
                values={values}
            />
        )

        // We use an intermediate component here rather than calling `createElement` directly
        // because we want to resolve the style from our motion values only once every
        // functional component has resolved. Resolving it here would do it before the functional components
        // themselves are executed.
        const handleComponent = (
            <RenderComponent
                base={Component}
                props={props}
                innerRef={ref}
                style={style}
                values={values}
            />
        )

        return (
            <MotionContext.Provider value={context}>
                <MountMotionValues ref={ref} values={values} />
                {handleAnimate}
                {handleGestures}
                {handleDrag}
                {handleComponent}
            </MotionContext.Provider>
        )
    }

    return forwardRef(MotionComponent)
}
