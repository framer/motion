import { RecordData } from "./types"

export function record(data: RecordData) {
    if (window.MotionDebug) {
        window.MotionDebug.record(data)
    }
}
