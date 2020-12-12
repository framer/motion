import {
    Presence,
    VisibilityAction,
    SharedLayoutAnimationConfig,
} from "../types"
import { LayoutStack } from "./stack"
import { HTMLVisualElement } from "../../../render/dom/HTMLVisualElement"
import { AxisBox2D } from "../../../types/geometry"

export function createSwitchAnimation(
    child: HTMLVisualElement,
    stack?: LayoutStack
): SharedLayoutAnimationConfig {
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

    let originBox: AxisBox2D | undefined
    let targetBox: AxisBox2D | undefined

    if (child.presence === Presence.Entering) {
        originBox = stack?.getFollowOrigin()
    } else if (child.presence === Presence.Exiting) {
        targetBox = stack?.getFollowTarget()
    }

    return { originBox, targetBox }
}

export function createCrossfadeAnimation(
    child: HTMLVisualElement,
    stack?: LayoutStack
): SharedLayoutAnimationConfig {
    const config: SharedLayoutAnimationConfig = {}
    const stackLead = stack && stack.lead
    const stackLeadPresence = stackLead?.presence

    if (stack && child === stackLead) {
        if (child.presence === Presence.Entering) {
            config.originBox = stack.getFollowOrigin()
        } else if (child.presence === Presence.Exiting) {
            config.targetBox = stack.getFollowTarget()
        }
    } else if (stack && child === stack.follow) {
        config.transition = stack.getLeadTransition()
        if (stackLeadPresence === Presence.Entering) {
            config.targetBox = stack.getLeadTarget()
        } else if (stackLeadPresence === Presence.Exiting) {
            config.originBox = stack.getLeadOrigin()
        }
    }

    // If neither the lead or follow component is the root child of AnimatePresence,
    // don't handle crossfade animations
    if (!stack?.follow?.isPresenceRoot && !stackLead?.isPresenceRoot) {
        return config
    }

    if (!stack || child === stackLead) {
        if (child.presence === Presence.Entering) {
            config.crossfadeOpacity = stack?.follow?.getValue("opacity", 0)
        }
    } else if (stack && child === stack.follow) {
        if (!stackLead || stackLeadPresence === Presence.Entering) {
        } else if (stackLeadPresence === Presence.Exiting) {
            config.crossfadeOpacity = stack?.lead?.getValue("opacity", 1)
        }
    } else {
        config.visibilityAction = VisibilityAction.Hide
    }

    return config
}
