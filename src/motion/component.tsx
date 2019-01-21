import * as React from "react"
import { memo, forwardRef, Ref, ComponentType } from "react"
import { useExternalRef } from "./utils/use-external-ref"
import { useMotionValues } from "./utils/use-motion-values"
import { addMotionStyles } from "./utils/style-attr"
import { useAnimationControls } from "./utils/use-animation-controls"
import { MotionContext, useMotionContext } from "./utils/MotionContext"
import { MotionProps } from "./types"
import {
    isGesturesEnabled,
    isDragEnabled,
    isAnimationSubscription,
    isPosed,
    isAnimateValues,
    AnimationSubscription,
    AnimateValues,
    Posed,
    Gestures,
    Draggable,
    RenderComponent,
} from "./utils/functionality"

export const createMotionComponent = <P extends {}>(Component: string | ComponentType<P>) => {
    const MotionComponent = (p: P & MotionProps, externalRef?: Ref<Element>) => {
        const {
            animate,
            variants,
            style: motionStyle,
            onAnimationComplete,
            transition,
            inherit = false,
            initialPose,
            dragEnabled,
            dragLocksDirection,
            dragPropagation,
            ...props
        } = p as MotionProps
        const ref = useExternalRef(externalRef)
        const values = useMotionValues(ref)
        const style = addMotionStyles(values, motionStyle)
        const controls = useAnimationControls(values, inherit, props, ref)
        const context = useMotionContext(controls, inherit) // initialPose || animate ?

        // Add functionality
        const handleAnimation = isAnimationSubscription(animate) && (
            <AnimationSubscription animate={animate} controls={controls} />
        )

        const handlePoses = isPosed(animate) && (
            <Posed
                variants={variants}
                target={animate}
                inherit={inherit}
                controls={controls}
                onAnimationComplete={onAnimationComplete}
                initialPose={initialPose}
            />
        )

        const handleAnimateValues = isAnimateValues(animate) && (
            <AnimateValues
                target={animate}
                transition={transition}
                values={values}
                controls={controls}
                onComplete={onAnimationComplete}
            />
        )

        const handleGestures = isGesturesEnabled(p) && <Gestures {...p} innerRef={ref} />

        const handleDrag = isDragEnabled(p) && (
            <Draggable
                dragEnabled={dragEnabled}
                dragLocksDirection={dragLocksDirection}
                dragPropagation={dragPropagation}
                innerRef={ref}
                values={values}
            />
        )

        // We use an intermediate component here rather than calling `createElement` directly
        // because we want to resolve the style from our motion values only once every
        // functional component has resolved. Resolving it here would do it before the functional components
        // themselves are executed.
        const handleComponent = (
            <RenderComponent base={Component} remainingProps={props} innerRef={ref} style={style} values={values} />
        )

        return (
            <MotionContext.Provider value={context}>
                {handleAnimation}
                {handlePoses}
                {handleAnimateValues}
                {handleGestures}
                {handleDrag}
                {handleComponent}
            </MotionContext.Provider>
        )
    }

    return memo(forwardRef(MotionComponent))
}
