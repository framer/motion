import { ProgressIntersection } from "../types"

export const ScrollOffset: Record<string, ProgressIntersection[]> = {
  Enter: [
    [0, 1],
    [1, 1],
  ],
  Exit: [
    [0, 0],
    [1, 0],
  ],
  Any: [
    [1, 0],
    [0, 1],
  ],
  All: [
    [0, 0],
    [1, 1],
  ],
}
