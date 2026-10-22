import { SequenceTime } from "../types"

/**
 * Given a absolute or relative time definition and current/prev time state of the sequence,
 * calculate an absolute time for the next keyframes.
 */
export function calcNextTime(
    current: number,
    next: SequenceTime,
    prev: number,
    labels: Map<string, number>
): number {
    if (typeof next === "number") {
        return next
    } else if (next === "<") {
        return prev
    } else if (next.startsWith("<")) {
        return Math.max(0, prev + parseFloat(next.slice(1)))
    }

    /**
     * Times relative to the current time ("+1", "-1") or to a label
     * ("my label+1", "my label-1"). Exact label names take precedence.
     */
    const offset = !labels.has(next) && next.match(/^(.*)([+-][\d.]+)$/)

    return offset
        ? Math.max(
              0,
              (labels.get(offset[1]) ?? current) + parseFloat(offset[2])
          )
        : labels.get(next) ?? current
}
