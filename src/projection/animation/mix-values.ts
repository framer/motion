import { mix } from "popmotion"
import { ResolvedValues } from "../../render/types"

const borders = ["TopLeft", "TopRight", "BottomLeft", "BottomRight"]
const numBorders = borders.length

export function mixValues(
    target: ResolvedValues,
    follow: ResolvedValues,
    lead: ResolvedValues,
    progress: number,
    shouldCrossfadeOpacity: boolean
) {
    if (shouldCrossfadeOpacity) {
        target.opacity = mix(0, (lead.opacity as number) ?? 1, progress)
        target.opacityExit = mix((follow.opacity as number) ?? 1, 0, progress)
    }

    /**
     * Mix border radius
     */
    for (let i = 0; i < numBorders; i++) {
        const borderLabel = `border${borders[i]}Radius`
        let followRadius = getRadius(follow, borderLabel)
        let leadRadius = getRadius(lead, borderLabel)

        if (followRadius === undefined && leadRadius === undefined) continue

        followRadius ||= 0
        leadRadius ||= 0

        /**
         * Currently we're only crossfading between numerical border radius.
         * It would be possible to crossfade between percentages for a little
         * extra bundle size.
         */
        if (
            typeof followRadius === "number" &&
            typeof leadRadius === "number"
        ) {
            const radius = Math.max(mix(followRadius, leadRadius, progress), 0)
            target[borderLabel] = radius
        }
    }
}

function getRadius(values: ResolvedValues, radiusName: string) {
    return values[radiusName] ?? values.borderRadius
}

// /**
//  * Mix rotation
//  */
// if (latestFollowValues.rotate || latestLeadValues.rotate) {
//     const rotate = mix(
//         (latestFollowValues.rotate as number) || 0,
//         (latestLeadValues.rotate as number) || 0,
//         p
//     )
//     leadState.rotate = followState.rotate = rotate
// }

// /**
//  * We only want to mix the background color if there's a follow element
//  * that we're not crossfading opacity between. For instance with switch
//  * AnimateSharedLayout animations, this helps the illusion of a continuous
//  * element being animated but also cuts down on the number of paints triggered
//  * for elements where opacity is doing that work for us.
//  */
// if (
//     !hasFollowElement &&
//     latestLeadValues.backgroundColor &&
//     latestFollowValues.backgroundColor
// ) {
//     /**
//      * This isn't ideal performance-wise as mixColor is creating a new function every frame.
//      * We could probably create a mixer that runs at the start of the animation but
//      * the idea behind the crossfader is that it runs dynamically between two potentially
//      * changing targets (ie opacity or borderRadius may be animating independently via variants)
//      */
//     leadState.backgroundColor = followState.backgroundColor = mixColor(
//         latestFollowValues.backgroundColor as string,
//         latestLeadValues.backgroundColor as string
//     )(p)
// }
