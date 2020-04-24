//import { Auto } from "../../motion/features/auto/Auto"
import { Snapshot, AutoAnimationConfig } from "../../motion/features/auto/types"
import {
    LayoutMetadata,
    Presence,
    StackQuery,
    VisibilityAction,
    StackPosition,
} from "./types"

export function createSwitchAnimation(
    { layoutId, presence, position, prevPosition }: LayoutMetadata,
    stack: StackQuery
): AutoAnimationConfig {
    // TODO Switch prevPosition to see if this is lead, then we
    // can remove prevPosition
    if (presence !== Presence.Entering && position !== prevPosition) {
        return {
            visibilityAction:
                position === StackPosition.Lead
                    ? VisibilityAction.Show
                    : VisibilityAction.Hide,
        }
    }

    let origin: Snapshot | undefined
    let target: Snapshot | undefined

    if (presence === Presence.Entering) {
        origin = stack.getPreviousOrigin(layoutId)
    } else if (presence === Presence.Exiting) {
        target = stack.getPreviousTarget(layoutId)
    }

    return { origin, target }
}

export function createCrossfadeAnimation(
    { layoutId, presence, position, depth }: LayoutMetadata,
    stack: StackQuery
): AutoAnimationConfig {
    const config: AutoAnimationConfig = {}

    if (position === StackPosition.Lead) {
        if (presence === Presence.Entering) {
            config.origin = stack.getPreviousOrigin(layoutId)
        } else if (presence === Presence.Exiting) {
            config.target = stack.getPreviousTarget(layoutId)
        }
    } else if (position === StackPosition.Previous) {
        const lead = stack.getLead(layoutId)
        if (lead && lead.presence === Presence.Entering) {
            config.target = stack.getLeadTarget(layoutId)
        } else if (lead && lead.presence === Presence.Exiting) {
            config.origin = stack.getLeadOrigin(layoutId)
        }
    }

    // Handle crossfade opacity
    if (stack.isRootDepth(depth)) {
        if (position === StackPosition.Lead || layoutId === undefined) {
            if (presence === Presence.Entering) {
                config.crossfade = stack.getCrossfadeIn()
            } else if (presence === Presence.Exiting) {
                config.crossfade = stack.getCrossfadeOut()
            }
        } else if (position === StackPosition.Previous) {
            const lead = stack.getLead(layoutId)
            if (!lead || (lead && lead.presence === Presence.Entering)) {
                config.crossfade = stack.getCrossfadeOut()
            } else if (lead && lead.presence === Presence.Exiting) {
                config.crossfade = stack.getCrossfadeIn()
            }
        } else {
            config.visibilityAction = VisibilityAction.Hide
        }
    }

    return config
}
