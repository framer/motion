import { Easing } from "../../easing/types"
import type { MotionValue } from "../../value"
import { DynamicAnimationOptions } from "../animate"
import {
    DOMKeyframesDefinition,
    ElementOrSelector,
    Transition,
    AnimationPlaybackOptions,
    UnresolvedValueKeyframe,
} from "../types"

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
    string | number,
    (Transition & At)?
]

export type DOMSegment = [
    ElementOrSelector,
    DOMKeyframesDefinition,
    (DynamicAnimationOptions & At)?
]

export type Segment = DOMSegment | SequenceLabel | SequenceLabelWithTime

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

export interface ElementSequence {
    [key: string]: ValueSequence
}

export type ResolvedAnimationDefinition = {
    keyframes: { [key: string]: UnresolvedValueKeyframe[] }
    transition: { [key: string]: DynamicAnimationOptions }
}

export type ResolvedAnimationDefinitions = Map<
    Element,
    ResolvedAnimationDefinition
>
