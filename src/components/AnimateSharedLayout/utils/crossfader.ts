import { getFrameData } from "framesync"
import {
    circOut,
    linear,
    mix,
    PlaybackControls,
    progress as calcProgress,
} from "popmotion"
import { animate } from "../../../animation/animate"
import { ResolvedValues, VisualElement } from "../../../render/types"
import { EasingFunction, Transition } from "../../../types"
import { motionValue } from "../../../value"

export interface Crossfader {
    isActive(): boolean
    getCrossfadeState(element: VisualElement): ResolvedValues
    from(transition?: Transition): PlaybackControls
    to(transition?: Transition): PlaybackControls
    setOptions(options: CrossfadeAnimationOptions): void
    reset(): void
}

export interface CrossfadeAnimationOptions {
    lead?: VisualElement
    follow?: VisualElement
    crossfadeOpacity?: boolean
    preserveFollowOpacity?: boolean
}

/**
 * TODO: Test crossfadder
 */
export function createCrossfader(): Crossfader {
    /**
     * The current state of the crossfade as a value between 0 and 1
     */
    const progress = motionValue(1)

    let options: CrossfadeAnimationOptions = {
        lead: undefined,
        follow: undefined,
        crossfadeOpacity: false,
        preserveFollowOpacity: false,
    }

    let leadState: ResolvedValues = {}
    let followState: ResolvedValues = {}

    /**
     *
     */
    let isActive = false

    /**
     *
     */
    let hasRenderedFinalCrossfade = true

    /**
     * Framestamp of the last frame we updated values at.
     */
    let prevUpdate = 0

    function startCrossfadeAnimation(target: number, transition?: Transition) {
        const { lead, follow } = options
        isActive = true
        hasRenderedFinalCrossfade = false

        return animate(progress, target, {
            ...transition,
            onUpdate: () => {
                lead && lead.scheduleRender()
                follow && follow.scheduleRender()
            },
            onComplete: () => (isActive = false),
        } as any)
    }

    function updateCrossfade() {
        /**
         * We only want to compute the crossfade once per frame, so we
         * compare the previous update framestamp with the current frame
         * and early return if they're the same.
         */
        const { timestamp } = getFrameData()
        const { lead, follow } = options
        if (timestamp === prevUpdate || !lead) return
        prevUpdate = timestamp

        /**
         * Merge each component's latest values into our crossfaded state
         * before crossfading.
         */
        Object.assign(leadState, lead.getLatestValues())
        follow && Object.assign(followState, follow.getLatestValues())

        /**
         * If the crossfade animation is no longer active, flag that we've
         * rendered the final frame of animation.
         *
         * TODO: This will result in the final frame being rendered only
         * for the first component to render the frame. Perhaps change
         * this to recording the timestamp of the final frame.
         */
        if (!isActive) hasRenderedFinalCrossfade = true

        const p = progress.get()

        /**
         * Crossfade the opacity between the two components. This will result
         * in a different opacity for each component.
         */
        if (options.crossfadeOpacity) {
            const leadTargetOpacity =
                (lead.getStaticValue("opacity") as number) ?? 1
            const followTargetOpacity =
                (follow?.getStaticValue("opacity") as number) ?? 1

            leadState.opacity = mix(0, leadTargetOpacity, easeCrossfadeIn(p))
            followState.opacity = options.preserveFollowOpacity
                ? followTargetOpacity
                : mix(followTargetOpacity, 0, easeCrossfadeOut(p))
        }
    }

    return {
        isActive: () => leadState && (isActive || !hasRenderedFinalCrossfade),
        from(transition) {
            return startCrossfadeAnimation(0, transition)
        },
        to(transition) {
            progress.set(1 - progress.get())
            return startCrossfadeAnimation(1, transition)
        },
        reset: () => progress.set(1),
        getCrossfadeState(element) {
            updateCrossfade()
            return element === options.lead ? leadState : followState
        },
        setOptions(newOptions) {
            options = newOptions
            leadState = {}
            followState = {}
        },
    }
}

const easeCrossfadeIn = compress(0, 0.5, circOut)
const easeCrossfadeOut = compress(0.5, 0.95, linear)

function compress(
    min: number,
    max: number,
    easing: EasingFunction
): EasingFunction {
    return (p: number) => {
        // Could replace ifs with clamp
        if (p < min) return 0
        if (p > max) return 1
        return easing(calcProgress(min, max, p))
    }
}

// const borders = ["TopLeft", "TopRight", "BottomLeft", "BottomRight"]
// const numBorders = borders.length
// function mixBorderRadius(
//     from: VisualElement,
//     to: VisualElement,
//     fromValues: ResolvedValues,
//     toValues: ResolvedValues,
//     p: number
// ) {
//     const fromLatest = from.getLatestValues()
//     const toLatest = to.getLatestValues()
//     for (let i = 0; i < numBorders; i++) {
//         const borderLabel = "border" + borders[i] + "Radius"
//         const fromRadius =
//             fromLatest[borderLabel] ?? fromLatest.borderRadius ?? 0
//         const toRadius = toLatest[borderLabel] ?? toLatest.borderRadius ?? 0
//         // TODO We should only do this if we have border radius
//         // But not doing it at all isn't correctly animating 0 -> 0 that have
//         // previously encountered a crossfade to/from a radius
//         if (typeof fromRadius === "number" && typeof toRadius === "number") {
//             fromValues[borderLabel] = toValues[borderLabel] = mix(
//                 fromRadius as number,
//                 toRadius as number,
//                 p
//             )
//         }
//     }
//     if (fromLatest.rotate || toLatest.rotate) {
//         fromValues.rotate = toValues.rotate = mix(
//             (fromLatest.rotate as number) || 0,
//             (toLatest.rotate as number) || 0,
//             p
//         )
//     }
// }
