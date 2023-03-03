import { cancelSync, sync } from "../../frameloop"
import { FrameData } from "../../frameloop/types"
import { Driver } from "./types"

export const frameloopDriver: Driver = (update) => {
    const passTimestamp = ({ timestamp }: FrameData) => update(timestamp)

    return {
        start: () => sync.update(passTimestamp, true),
        stop: () => cancelSync.update(passTimestamp),
    }
}
