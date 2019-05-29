import { invariant } from "hey-listen"
import { Easing } from "./"
import { EasingDefinition } from "./types"

const {
    linear,
    expoIn,
    expoOut,
    expoInOut,
    circIn,
    circOut,
    circInOut,
    backIn,
    backOut,
    backInOut,
    anticipate,
} = Easing

const namedEasing = {
    linear,
    easeIn: expoIn,
    easeOut: expoOut,
    easeInOut: expoInOut,
    circIn,
    circOut,
    circInOut,
    backIn,
    backOut,
    backInOut,
    anticipate,
}

export const easingLookup = (definition: EasingDefinition) => {
    if (Array.isArray(definition)) {
        // If cubic bezier definition, create bezier curve
        invariant(
            definition.length === 4,
            `Cubic bezier arrays must contain four numerical values.`
        )

        const [x1, y1, x2, y2] = definition
        return Easing.cubicBezier(x1, y1, x2, y2)
    } else if (typeof definition === "string") {
        // Else lookup from table
        invariant(
            namedEasing[definition] !== undefined,
            `Invalid easing type '${definition}'`
        )
        return namedEasing[definition]
    }

    return definition
}

export const isEasingArray = (ease: any): ease is EasingDefinition[] => {
    return Array.isArray(ease) && typeof ease[0] !== "number"
}
