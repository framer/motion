export interface ProjectionFrame {
    type: "projectionFrame"
    totalNodes: number
    resolvedTargetDeltas: number
    recalculatedProjection: number
}

export type RecordData = ProjectionFrame

declare global {
    interface Window {
        MotionDebug?: {
            record: (data: RecordData) => void
        }
    }
}
