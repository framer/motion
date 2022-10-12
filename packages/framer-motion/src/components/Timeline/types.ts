import { ReactNode } from "react"
import {
    Easing,
    ResolvedKeyframesTarget,
    Target,
    Transition,
} from "../../types"
import type { MotionValue } from "../../value"

export type SegmentOptions = Transition & { at?: TimeDefinition }

export type TimelineSegment =
    | [string, Target]
    | [string, Target, SegmentOptions]

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

export interface TimelineContextProps {}

export interface TracksManager {
    addTrack(name: string): void
}

export interface UnresolvedTimeline {
    duration: number
    tracks: {
        [trackName: string]: {
            [valueName: string]: {
                keyframes: ResolvedKeyframesTarget
                offsets: number[]
                easing: Easing[]
            }
        }
    }
}
