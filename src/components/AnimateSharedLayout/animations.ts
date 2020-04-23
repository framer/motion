//import { Auto } from "../../motion/features/auto/Auto"
import {
    Snapshot,
    AutoAnimationConfig,
    VisibilityAction,
} from "../../motion/features/auto/types"
import { LayoutMetadata, Presence, StackQuery } from "./types"

export function createSwitchAnimation(
    { layoutId, presence, isLead, wasLead }: LayoutMetadata,
    stack: StackQuery
): AutoAnimationConfig {
    if (presence !== Presence.Entering && isLead !== wasLead) {
        return {
            visibilityAction: isLead
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
    _metadata: LayoutMetadata
): AutoAnimationConfig {
    const animationConfig = {}
    return animationConfig
}

// function switchAnimation(child: Auto) {
//   const {
//       isVisible,
//       shouldResumeFromPrevious,
//       shouldRestoreVisibility,
//   } = getChildData(child)

//   if (!isVisible) {
//       child.hide()
//   } else {

//       if (child.isPresent()) {
//           if (shouldResumeFromPrevious) {
//               origin = getPreviousOrigin(child)
//           }

//           if (shouldRestoreVisibility) {
//               child.show()
//               return
//           }
//       } else {
//           target = getPreviousTarget(child)
//       }

//       child.startAnimation({ origin, target, transition })
//   }
// }
