import { TimeDefinition } from "../types"

export function calcNextTime(
    currentTime: number,
    prevTime: number,
    labels: Map<string, number>,
    nextTime?: TimeDefinition
) {
    if (nextTime === undefined) {
        return currentTime
    } else if (typeof nextTime === "number") {
        return nextTime
    } else if (nextTime.startsWith("-") || nextTime.startsWith("+")) {
        return Math.max(0, currentTime + parseFloat(nextTime))
    } else if (nextTime.startsWith("<")) {
        nextTime = nextTime.replace("<", "")
        return nextTime === ""
            ? prevTime
            : Math.max(0, prevTime + parseFloat(nextTime))
    } else {
        return labels.get(nextTime) ?? currentTime
    }
}
