import { clamp } from "../utils/clamp"
import { EasingFunction } from "./types"
/*
  Create stepped version of 0-1 progress

  @param [int]: Number of steps
  @param [number]: Current value
  @return [number]: Stepped value
*/
export type Direction = "start" | "end"

export const steps = (
    steps: number,
    direction: Direction = "end"
): EasingFunction => p => {
    p = direction === "end" ? Math.min(p, 0.999) : Math.max(p, 0.001)

    const expanded = p * steps
    const rounded =
        direction === "end" ? Math.floor(expanded) : Math.ceil(expanded)

    return clamp(0, 1, rounded / steps)
}
