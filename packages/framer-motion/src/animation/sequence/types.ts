import { Easing } from "../../easing/types"
import { GenericKeyframesTarget } from "../../types"
import type { MotionValue } from "../../value"
import { DynamicAnimationOptions } from "../types"
import {
    DOMKeyframesDefinition,
    ElementOrSelector,
    Transition,
    AnimationPlaybackOptions,
    UnresolvedValueKeyframe,
} from "../types"

export type ObjectTarget<O extends Object> = {
    [K in keyof O]: O[K] | GenericKeyframesTarget<O[K]>
}

export type SequenceTime =
    | number
    | "<"
    | `+${number}`
    | `-${number}`
    | `${string}`

export type SequenceLabel = string

export interface SequenceLabelWithTime {
    name: SequenceLabel
    at: SequenceTime
}

export interface At {
    at?: SequenceTime
}

export type MotionValueSegment = [
    MotionValue,
    UnresolvedValueKeyframe | UnresolvedValueKeyframe[]
]

export type MotionValueSegmentWithTransition = [
    MotionValue,
    UnresolvedValueKeyframe | UnresolvedValueKeyframe[],
    Transition & At
]

export type DOMSegment = [ElementOrSelector, DOMKeyframesDefinition]

export type DOMSegmentWithTransition = [
    ElementOrSelector,
    DOMKeyframesDefinition,
    DynamicAnimationOptions & At
]

export type ObjectSegment<O extends Object = Object> = [O, ObjectTarget<O>]

export type ObbjectSegmentWithTransition<O extends Object = Object> = [
    O,
    ObjectTarget<O>,
    DynamicAnimationOptions & At
]

export type Segment =
    | MotionValueSegment
    | MotionValueSegmentWithTransition
    | DOMSegment
    | DOMSegmentWithTransition
    | ObjectSegment
    | ObbjectSegmentWithTransition
    | SequenceLabel
    | SequenceLabelWithTime

export type AnimationSequence = Segment[]

export interface SequenceOptions extends AnimationPlaybackOptions {
    delay?: number
    duration?: number
    defaultTransition?: Transition
}

export interface AbsoluteKeyframe {
    value: string | number | null
    at: number
    easing?: Easing
}

export type ValueSequence = AbsoluteKeyframe[]

export interface SequenceMap {
    [key: string]: ValueSequence
}

export type ResolvedAnimationDefinition = {
    keyframes: { [key: string]: UnresolvedValueKeyframe[] }
    transition: { [key: string]: Transition }
}

export type ResolvedAnimationDefinitions = Map<
    Element | MotionValue,
    ResolvedAnimationDefinition
>
