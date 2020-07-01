import { Easing, circOut, linear } from "@popmotion/easing"
import { progress, mix } from "@popmotion/popcorn"
import { Snapshot, AutoAnimationConfig } from "../../motion/features/auto/types"
import { Presence, VisibilityAction } from "./types"
import { LayoutStack } from "./stack"
import { HTMLVisualElement } from "../../render/dom/HTMLVisualElement"

export function createSwitchAnimation(
    child: HTMLVisualElement,
    _isRoot: boolean,
    stack?: LayoutStack
): AutoAnimationConfig {
    if (stack && child !== stack.lead) {
        return { visibilityAction: VisibilityAction.Hide }
    } else if (
        stack &&
        child.presence !== Presence.Entering &&
        child === stack.lead &&
        stack.lead !== stack.prevLead
    ) {
        return { visibilityAction: VisibilityAction.Show }
    }

    let origin: Snapshot | undefined
    let target: Snapshot | undefined

    if (child.presence === Presence.Entering) {
        origin = stack?.getFollowOrigin()
    } else if (child.presence === Presence.Exiting) {
        target = stack?.getFollowTarget()
    }

    return { origin, target }
}

export function createCrossfadeAnimation(
    child: HTMLVisualElement,
    isRoot: boolean,
    stack?: LayoutStack
): AutoAnimationConfig {
    const config: AutoAnimationConfig = {}
    const stackLead = stack && stack.lead
    const stackLeadPresence = stackLead?.presence

    if (stack && child === stackLead) {
        if (child.presence === Presence.Entering) {
            config.origin = stack.getFollowOrigin()
        } else if (child.presence === Presence.Exiting) {
            config.target = stack.getFollowTarget()
        }
    } else if (stack && child === stack.follow) {
        if (stackLeadPresence === Presence.Entering) {
            config.target = stack.getLeadTarget()
        } else if (stackLeadPresence === Presence.Exiting) {
            config.origin = stack.getLeadOrigin()
        }
    }

    // // Handle crossfade opacity
    if (!isRoot) return config

    if (!stack || child === stackLead) {
        if (child.presence === Presence.Entering) {
            config.crossfade = crossfadeIn
        } else if (child.presence === Presence.Exiting) {
            config.crossfade = crossfadeOut
        }
    } else if (stack && child === stack.follow) {
        if (!stackLead || stackLeadPresence === Presence.Entering) {
            config.crossfade = crossfadeOut
        } else if (stackLeadPresence === Presence.Exiting) {
            config.crossfade = crossfadeIn
        }
    } else {
        config.visibilityAction = VisibilityAction.Hide
    }

    return config
}

function compress(min: number, max: number, easing: Easing): Easing {
    return (p: number) => {
        // Could replace ifs with clamp
        if (p < min) return 0
        if (p > max) return 1
        return easing(progress(min, max, p))
    }
}

const easeCrossfadeIn = compress(0, 0.5, circOut)
const easeCrossfadeOut = compress(0.5, 0.95, linear)

export const crossfadeIn = (_origin: number, target: number, p: number) =>
    mix(0, target, easeCrossfadeIn(p))

export const crossfadeOut = (origin: number, _target: number, p: number) =>
    mix(origin, 0, easeCrossfadeOut(p))
