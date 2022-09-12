import { animateStyle } from "@motionone/dom"
import { Animation } from "@motionone/animation"
import { VariantLabels } from "../../../motion/types"
import { AnimationType } from "../../../render/utils/types"
import { TargetAndTransition } from "../../../types"
import { AnimatedProps, VariantContext } from "../types"
import { scheduleAnimation, unscheduleAnimation } from "./process"

const variantPriority: Array<keyof VariantContext> = [
    "initial",
    "animate",
    "whileHover",
    "whilePress",
    "whileInView",
    "exit",
]

export class AnimationState {
    parent?: AnimationState

    props: AnimatedProps

    element: HTMLElement

    depth: number = 0

    active = {
        [AnimationType.Animate]: createTypeState(true),
        [AnimationType.InView]: createTypeState(),
        [AnimationType.Hover]: createTypeState(),
        [AnimationType.Tap]: createTypeState(),
        [AnimationType.Drag]: createTypeState(),
        [AnimationType.Focus]: createTypeState(),
        [AnimationType.Exit]: createTypeState(),
    }

    context: VariantContext = {}

    constructor(props: AnimatedProps, parent?: AnimationState) {
        this.parent = parent
        if (parent) this.depth = parent.depth + 1
        this.updateProps(props)
    }

    mount(element: HTMLElement) {
        this.element = element
    }

    updateProps(props: AnimatedProps) {
        this.props = props

        for (const name of variantPriority) {
            this.context[name] =
                typeof props[name] === "string"
                    ? props[name]
                    : this.parent?.context[name]
        }
    }

    update() {
        // TODO: DOnt do this if static
        //this.updateEvents
        scheduleAnimation(this)
    }

    hasAnimated = false
    animateChanges() {
        if (!this.element || this.hasAnimated) return
        this.hasAnimated = true
        for (const type of variantPriority) {
            const prop = this.props[type]
            if (!prop) continue

            for (const key in prop) {
                animateStyle(
                    this.element,
                    key,
                    prop[key],
                    prop.transition || this.props.transition || {},
                    Animation
                )() // TODO: Batch
            }
        }
    }

    unmount() {
        unscheduleAnimation(this)
    }
}

interface AnimationTypeState {
    isActive: boolean
    protectedKeys: { [key: string]: true }
    needsAnimating: { [key: string]: boolean }
    prevResolvedValues: { [key: string]: any }
    prevProp?: VariantLabels | TargetAndTransition
}

function createTypeState(isActive = false): AnimationTypeState {
    return {
        isActive,
        protectedKeys: {},
        needsAnimating: {},
        prevResolvedValues: {},
    }
}
