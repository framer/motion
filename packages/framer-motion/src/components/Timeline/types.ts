import { ReactNode } from "react"
import { Easing, TargetWithKeyframes, Transition } from "../../types"
import type { MotionValue } from "../../value"

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

export interface TimelineProps {
    initial?: boolean
    animate: TimelineSequence
    options?: TimelineOptions
    progress?: MotionValue<number>
    children: ReactNode
}

export interface Timeline {
    getStatic(trackName: string): {
        [key: string]: string | number
    }
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
