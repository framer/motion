import { frame, cancelFrame } from "../../../frameloop"
import { frameData } from "../../../frameloop"
import { time } from "../../../frameloop/sync-time"
import { FrameData } from "../../../frameloop/types"
import { Driver } from "./types"

export const frameloopDriver: Driver = (update) => {
    const passTimestamp = ({ timestamp }: FrameData) => update(timestamp)

    return {
        start: () => frame.update(passTimestamp, true),
        stop: () => cancelFrame(passTimestamp),
        /**
         * If we're processing this frame we can use the
         * framelocked timestamp to keep things in sync.
         */
        now: () => (frameData.isProcessing ? frameData.timestamp : time.now()),
    }
}
