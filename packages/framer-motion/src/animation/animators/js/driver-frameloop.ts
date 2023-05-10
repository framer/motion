import { frame, cancelFrame } from "../../../frameloop"
import { frameData } from "../../../frameloop/data"
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
        now: () =>
            frameData.isProcessing ? frameData.timestamp : performance.now(),
    }
}
