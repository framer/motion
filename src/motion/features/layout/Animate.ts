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
    private prevLayoutBox: AxisBox2D

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

    getSnapshotBeforeUpdate() {
        this.snapshot()
        return null
    }

    componentDidMount() {
        const { visualElement } = this.props
        visualElement.enableLayoutAware()
    }

    componentDidUpdate() {
        const { visualElement } = this.props
        if (visualElement.isTargetBoxLocked) return

        eachAxis(axis => this.animateAxis(axis))
    }

    componentWillMount() {
        eachAxis(axis => this.stopAxisAnimation[axis]())
    }

    animateAxis(axis: "x" | "y") {
        const { visualElement } = this.props
        const prevAxis = this.prevLayoutBox[axis]
        const newAxis = visualElement.layoutBox[axis]
        const frameTarget = this.frameTarget[axis]
        if (!hasMoved(prevAxis, newAxis)) return

        const progress = this.progress[axis]
        const stopAnimation = this.stopAxisAnimation[axis]

        const progressOrigin = 0
        const progressTarget = 1000

        progress.set(progressOrigin)
        progress.set(progressOrigin) // Set twice to hard-reset velocity

        const frame = () => {
            tweenAxis(frameTarget, prevAxis, newAxis, progress.get() / 1000)
            visualElement.setAxisTarget(axis, frameTarget.min, frameTarget.max)
        }

        frame()

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

    // updateAxisTarget(axis: "x" | "y", p: number, origin: Axis, target: Axis) {
    //     const frameTarget = this.frameTarget[axis]
    //     console.log(frameTarget, origin, target)
    //     tweenAxis(frameTarget, origin, target, p)
    // }

    snapshot() {
        const { visualElement } = this.props
        this.prevLayoutBox = visualElement.getBoundingBox()
        // TODO: Perhaps undo scale transform?
        return this.prevLayoutBox
    }

    render() {
        return null
    }
}

export const AnimateLayout: MotionFeature = {
    key: "animate-layout",
    shouldRender: (props: MotionProps) => !!props.layout,
    Component,
}

function hasMoved(a: Axis, b: Axis) {
    return a.min !== b.min || a.max !== b.max
}

const defaultTransition = {
    duration: 3,
}

function getAxisTransition(axis: "x" | "y", transition: Transition) {
    if (!transition) {
        return defaultTransition
    } else {
        return transition[axis] || transition["default"] || transition
    }
}
