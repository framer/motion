import * as React from "react"
import { MotionProps } from "../../types"
import { FeatureProps, MotionFeature } from "../types"
import { Axis, AxisBox2D } from "../../../types/geometry"
import { motionValue } from "../../../value"
import { eachAxis } from "../../../utils/each-axis"
import { startAnimation } from "../../../animation/utils/transitions"
import { tweenAxis } from "./utils"
import { Transition } from "../../../types"

class Component extends React.Component<FeatureProps> {
    private frameTarget = {
        x: { min: 0, max: 0 },
        y: { min: 0, max: 0 },
    }

    private progress = {
        x: motionValue(0),
        y: motionValue(0),
    }

    private stopAxisAnimation = {
        x: undefined,
        y: undefined,
    }

    private unsubLayoutReady: () => {}

    componentDidMount() {
        const { visualElement } = this.props
        visualElement.enableLayoutAware()
        this.unsubLayoutReady = visualElement.onLayoutReady(
            (layout, origin) => {
                console.log(layout.y, origin.y)
                if (!visualElement.isTargetBoxLocked) {
                    eachAxis(axis =>
                        this.animateAxis(axis, layout[axis], origin[axis])
                    )
                }
            }
        )
    }

    componentWillUnmount() {
        this.unsubLayoutReady()
        eachAxis(axis => {
            this.stopAxisAnimation[axis] && this.stopAxisAnimation[axis]()
        })
    }

    animateAxis(axis: "x" | "y", layout: Axis, origin: Axis) {
        if (!hasMoved(origin, layout)) return
        const { visualElement } = this.props
        const frameTarget = this.frameTarget[axis]

        const progress = this.progress[axis]
        const stopAnimation = this.stopAxisAnimation[axis]

        const progressOrigin = 0
        const progressTarget = 1000

        progress.set(progressOrigin)
        progress.set(progressOrigin) // Set twice to hard-reset velocity

        const frame = () => {
            tweenAxis(frameTarget, origin, layout, progress.get() / 1000)
            visualElement.setAxisTarget(axis, frameTarget.min, frameTarget.max)
        }

        frame()
        visualElement.render()

        stopAnimation && stopAnimation()

        const { transition } = this.props
        const axisTransition = getAxisTransition(axis, transition)
        const animation = startAnimation(
            axis,
            progress,
            progressTarget,
            axisTransition
        )

        const unsubscribeProgress = progress.onChange(frame)

        this.stopAxisAnimation[axis] = () => {
            progress.stop()
            unsubscribeProgress()
        }
    }

    render() {
        return null
    }
}

export const AnimateLayout: MotionFeature = {
    key: "animate-layout",
    shouldRender: (props: MotionProps) => !!props.layout || !!props.layoutId,
    Component,
}

function hasMoved(a: Axis, b: Axis) {
    return a.min !== b.min || a.max !== b.max
}

const defaultTransition = {
    //duration: 3,
}

function getAxisTransition(axis: "x" | "y", transition: Transition) {
    if (!transition) {
        return defaultTransition
    } else {
        return transition[axis] || transition["default"] || transition
    }
}
