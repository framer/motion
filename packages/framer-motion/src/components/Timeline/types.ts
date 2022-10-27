import { ResolvedValues, VisualElement } from "../../render/types"
import {
    Easing,
    Repeat,
    TargetWithKeyframes,
    Transition,
    TransitionDefinition,
} from "../../types"
import { MotionValue } from "../../value"

export type ValueTransition = {}

export type SegmentOptions = Transition & { at?: TimeDefinition }

export type TimelineSegment =
    | [string, TargetWithKeyframes]
    | [string, TargetWithKeyframes, SegmentOptions]

export interface TimelineOptions {
    duration?: number
    delay?: number
}

export type TimeDefinition =
    | number
    | "<"
    | `-${number}`
    | `+${number}`
    | `<+${number}`
    | `<-${number}`
    | string

export interface LabelDescription {
    name: string
    at?: TimeDefinition
}

export type TimelineSequence = Array<TimelineSegment | LabelDescription>

export type TimelineTransition = Repeat & TransitionDefinition

export interface TimelineProps {
    initial?: boolean
    animate: TimelineSequence
    transition?: Repeat & TransitionDefinition
    progress?: MotionValue<number>
}

export type UnresolvedKeyframeValue = string | number | null

export type UnresolvedAbsoluteKeyframe = {
    value: UnresolvedKeyframeValue
    at: number
    easing?: Easing
}

export type UnresolvedValueSequence = UnresolvedAbsoluteKeyframe[]

export interface UnresolvedTrackSequence {
    [key: string]: UnresolvedValueSequence
}

export interface UnresolvedTracks {
    [key: string]: UnresolvedTrackSequence
}

export interface UnresolvedTimeline {
    duration: number
    tracks: UnresolvedTracks
}

export type MapTimeToValue = (time: number) => number | string

export interface TimelineController {
    getInitialValues(trackName: string): {
        [key: string]: string | number
    }
    registerElement(element: VisualElement): void
    removeElement(element: VisualElement): void
    update(props: TimelineProps): void
    merge(element: VisualElement): void
    startCrossfade(element: VisualElement, valueName: string): void
    cancelCrossfade(element: VisualElement, valueName: string): void
    isAnimating(element: VisualElement, valueName: string): boolean
}

export interface ElementTimelineState {
    unsubscribe: VoidFunction
    timeToValue: {
        [key: string]: MapTimeToValue
    }
    latestResolvedValues: ResolvedValues
    crossfade: {
        [key: string]: { fromValue: number | string; mix: MotionValue<number> }
    }
}
