import sync, { getFrameData } from "framesync"
import {
    circOut,
    linear,
    mix,
    mixColor,
    progress as calcProgress,
} from "popmotion"
import { animate } from "../../../animation/animate"
import { getValueTransition } from "../../../animation/utils/transitions"
import { ResolvedValues, VisualElement } from "../../../render/types"
import { EasingFunction, Transition } from "../../../types"
import { motionValue } from "../../../value"

export interface Crossfader {
    isActive(): boolean
    getCrossfadeState(element: VisualElement): ResolvedValues | undefined
    toLead(transition?: Transition): Promise<void>
    fromLead(transition?: Transition): Promise<void>
    setOptions(options: CrossfadeAnimationOptions): void
    reset(): void
    stop(): void
    getLatestValues(): ResolvedValues
}

export interface CrossfadeAnimationOptions {
    lead?: VisualElement
    follow?: VisualElement
    prevValues?: ResolvedValues
    crossfadeOpacity?: boolean
    preserveFollowOpacity?: boolean
}

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

    let prevOptions = { ...options }

    let leadState: ResolvedValues = {}
    let followState: ResolvedValues = {}

    /**
     *
     */
    let isActive = false

    /**
     *
     */
    let finalCrossfadeFrame: number | null = null

    /**
     * Framestamp of the last frame we updated values at.
     */
    let prevUpdate = 0

    function startCrossfadeAnimation(target: number, transition?: Transition) {
        const { lead, follow } = options
        isActive = true
        finalCrossfadeFrame = null
        let hasUpdated = false

        return new Promise<void>((resolve) => {
            const onUpdate = () => {
                hasUpdated = true
                lead && lead.scheduleRender()
                follow && follow.scheduleRender()
            }

            const onComplete = () => {
                isActive = false

                /**
                 * If the crossfade animation is no longer active, flag a frame
                 * that we're still allowed to crossfade
                 */
                finalCrossfadeFrame = getFrameData().timestamp

                resolve()
            }

            transition =
                transition && getValueTransition(transition, "crossfade")

            animate(progress, target, {
                ...transition,
                onUpdate,
                onComplete: () => {
                    if (!hasUpdated) {
                        progress.set(target)
                        /**
                         * If we never ran an update, for instance if this was an instant transition, fire a
                         * simulated final frame to ensure the crossfade gets applied correctly.
                         */
                        sync.read(onComplete)
                    } else {
                        onComplete()
                    }

                    onUpdate()
                },
            } as any)
        })
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
        const latestLeadValues = lead.getLatestValues()
        Object.assign(leadState, latestLeadValues)
        const latestFollowValues = follow
            ? follow.getLatestValues()
            : options.prevValues
        Object.assign(followState, latestFollowValues)

        const p = progress.get()

        /**
         * Crossfade the opacity between the two components. This will result
         * in a different opacity for each component.
         */
        const leadTargetOpacity = (latestLeadValues.opacity as number) ?? 1
        const followTargetOpacity = (latestFollowValues?.opacity as number) ?? 1

        if (options.crossfadeOpacity && follow) {
            leadState.opacity = mix(
                /**
                 * If the follow child has been completely hidden we animate
                 * this opacity from its previous opacity, but otherwise from completely transparent.
                 */
                follow.isVisible !== false ? 0 : followTargetOpacity,
                leadTargetOpacity,
                easeCrossfadeIn(p)
            )
            followState.opacity = options.preserveFollowOpacity
                ? followTargetOpacity
                : mix(followTargetOpacity, 0, easeCrossfadeOut(p))
        } else if (!follow) {
            leadState.opacity = mix(followTargetOpacity, leadTargetOpacity, p)
        }

        mixValues(
            leadState,
            followState,
            latestLeadValues,
            latestFollowValues || {},
            Boolean(follow),
            p
        )
    }

    return {
        isActive: () =>
            leadState &&
            (isActive || getFrameData().timestamp === finalCrossfadeFrame),
        fromLead(transition) {
            return startCrossfadeAnimation(0, transition)
        },
        toLead(transition) {
            let initialProgress = 0

            if (!options.prevValues && !options.follow) {
                /**
                 * If we're not coming from anywhere, start at the end of the animation.
                 */
                initialProgress = 1
            } else if (
                prevOptions.lead === options.follow &&
                prevOptions.follow === options.lead
            ) {
                /**
                 * If we're swapping follow/lead we can reverse the progress
                 */
                initialProgress = 1 - progress.get()
            }

            progress.set(initialProgress)
            return startCrossfadeAnimation(1, transition)
        },
        reset: () => progress.set(1),
        stop: () => progress.stop(),
        getCrossfadeState(element) {
            updateCrossfade()
            if (element === options.lead) {
                return leadState
            } else if (element === options.follow) {
                return followState
            }
        },
        setOptions(newOptions) {
            prevOptions = options
            options = newOptions
            leadState = {}
            followState = {}
        },
        getLatestValues() {
            return leadState
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

const borders = ["TopLeft", "TopRight", "BottomLeft", "BottomRight"]
const numBorders = borders.length

function mixValues(
    leadState: ResolvedValues,
    followState: ResolvedValues,
    latestLeadValues: ResolvedValues,
    latestFollowValues: ResolvedValues,
    hasFollowElement: boolean,
    p: number
): void {
    /**
     * Mix border radius
     */
    for (let i = 0; i < numBorders; i++) {
        const borderLabel = `border${borders[i]}Radius`
        let followRadius = getRadius(latestFollowValues, borderLabel)
        let leadRadius = getRadius(latestLeadValues, borderLabel)

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
            const radius = Math.max(mix(followRadius, leadRadius, p), 0)
            leadState[borderLabel] = followState[borderLabel] = radius
        }
    }

    /**
     * Mix rotation
     */
    if (latestFollowValues.rotate || latestLeadValues.rotate) {
        const rotate = mix(
            (latestFollowValues.rotate as number) || 0,
            (latestLeadValues.rotate as number) || 0,
            p
        )
        leadState.rotate = followState.rotate = rotate
    }

    /**
     * We only want to mix the background color if there's a follow element
     * that we're not crossfading opacity between. For instance with switch
     * AnimateSharedLayout animations, this helps the illusion of a continuous
     * element being animated but also cuts down on the number of paints triggered
     * for elements where opacity is doing that work for us.
     */
    if (
        !hasFollowElement &&
        latestLeadValues.backgroundColor &&
        latestFollowValues.backgroundColor
    ) {
        /**
         * This isn't ideal performance-wise as mixColor is creating a new function every frame.
         * We could probably create a mixer that runs at the start of the animation but
         * the idea behind the crossfader is that it runs dynamically between two potentially
         * changing targets (ie opacity or borderRadius may be animating independently via variants)
         */
        leadState.backgroundColor = followState.backgroundColor = mixColor(
            latestFollowValues.backgroundColor as string,
            latestLeadValues.backgroundColor as string
        )(p)
    }
}

function getRadius(values: ResolvedValues, radiusName: string) {
    return values[radiusName] ?? values.borderRadius
}
