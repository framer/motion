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
    AnimationSubscription,
    Posed,
    Gestures,
    Draggable,
    RenderComponent,
} from "./utils/functionality"

export const createMotionComponent = <P extends {}>(Component: string | ComponentType<P>) => {
    const MotionComponent = (p: P & MotionProps, externalRef?: Ref<Element>) => {
        const {
            animate,
            pose = "default",
            style: motionStyle,
            onPoseComplete,
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
        const context = useMotionContext(controls, inherit, initialPose || pose)

        // Add functionality
        const handleAnimation = isAnimationSubscription(animate) && (
            <AnimationSubscription animate={animate} controls={controls} />
        )

        const handlePoses = isPosed(animate) && (
            <Posed
                animate={animate}
                inherit={inherit}
                controls={controls}
                onPoseComplete={onPoseComplete}
                pose={pose}
                initialPose={initialPose}
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
                {handleGestures}
                {handleDrag}
                {handleComponent}
            </MotionContext.Provider>
        )
    }

    return memo(forwardRef(MotionComponent))
}
