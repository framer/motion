import { Ref } from "react"
import { isRefObject } from "../../utils/is-ref-object"
import { MotionValue } from "../../value"
import sync, { cancelSync } from "framesync"
import { VisualElementConfig, ResolvedValues } from "./types"
import { AxisBox2D } from "../../types/geometry"
import { invariant } from "hey-listen"
import { Snapshot } from "../../components/AnimateSharedLayout/utils/stack"
import { Target, TargetAndTransition, Variants } from "../../types"
import { startAnimation } from "../../animation/utils/transitions"
import { AnimationState } from "../../render/utils/animation-state"
import { MotionProps } from "../../motion/types"

type Subscriptions = Map<string, () => void>

/**
 * VisualElement is an abstract class that provides a generic animation-optimised interface to the
 * underlying renderer.
 *
 * Currently many features interact directly with HTMLVisualElement/SVGVisualElement
 * but the idea is we can create, for instance, a ThreeVisualElement that extends
 * VisualElement and we can quickly offer all the same features.
 */
export abstract class VisualElement<E = any> {
    animationState?: AnimationState

    manuallyAnimateOnMount?: boolean

    inheritsVariants?: boolean

    isHoverEventsEnabled = true

    /**
     * A set of values that we animate back to when a value is cleared of all overrides.
     */
    baseTarget: Target = {}

    variantChildrenOrder?: Set<VisualElement<E>>
    addVariantChildOrder(visualElement: VisualElement<E>) {
        if (!this.variantChildrenOrder) this.variantChildrenOrder = new Set()
        this.variantChildrenOrder.add(visualElement)
    }

    // The latest resolved MotionValues
    latest: ResolvedValues = {}

    // TODO split this out again in a further refactor removing layout animations from
    // HTMLVisualElement
    animateMotionValue?: typeof startAnimation

    // The actual element
    protected element: E

    // A map of MotionValues used to animate this element
    values = new Map<string, MotionValue>()

    // Unsubscription callbacks for MotionValue subscriptions
    private valueSubscriptions: Subscriptions = new Map()

    protected treePath: VisualElement[]

    // A configuration for this VisualElement, each derived class can extend this.
    protected config: VisualElementConfig = {}

    isPresenceRoot?: boolean

    isMounted = false

    presenceId: number

    // An alias for element to allow VisualElement to be used
    // like a RefObject. This is a temporary measure to work with
    // some existing internal APIs.
    current: E

    // A pre-bound call to the user-provided `onUpdate` callback. This won't
    // be called more than once per frame.
    private update = () => this.config.onUpdate!(this.latest)

    // Trigger a synchronous render using the latest MotionValues
    abstract render(): void

    // Build display attributes
    abstract build(isReactRender: boolean): void

    // Clean data structures
    abstract clean(): void

    // A function that returns a bounding box for the rendered instance.
    abstract getBoundingBox(): AxisBox2D

    abstract updateLayoutDelta(): void

    abstract makeTargetAnimatable(
        targetAndTransition: TargetAndTransition,
        parseDOMValues?: boolean
    ): TargetAndTransition

    getBaseValue(key: string, _props: MotionProps) {
        return this.baseTarget[key]
    }
}
