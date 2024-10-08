import { EasingFunction } from "../../../../easing/types"
import { progress } from "../../../../utils/progress"

// Create a linear easing point for every 10 ms
const resolution = 10

export const generateLinearEasing = (
    easing: EasingFunction,
    duration: number // as milliseconds
): string => {
    let points = ""
    const numPoints = Math.max(Math.round(duration / resolution), 2)

    for (let i = 0; i < numPoints; i++) {
        points += easing(progress(0, numPoints - 1, i)) + ", "
    }

    return `linear(${points.substring(0, points.length - 2)})`
}
