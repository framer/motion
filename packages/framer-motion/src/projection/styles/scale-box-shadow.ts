import { complex } from "style-value-types"
import { cssVariableRegex } from "../../render/dom/utils/css-variables-conversion"
import { mix } from "../../utils/mix"
import { ScaleCorrectorDefinition } from "./types"

const varToken = "_$css"

export const correctBoxShadow: ScaleCorrectorDefinition = {
    correct: (latest: string, { treeScale, projectionDelta }) => {
        const original = latest

        /**
         * We need to first strip and store CSS variables from the string.
         */
        const containsCSSVariables = latest.includes("var(")
        const cssVariables: string[] = []
        if (containsCSSVariables) {
            latest = latest.replace(cssVariableRegex, (match) => {
                cssVariables.push(match)
                return varToken
            })
        }

        const shadow = complex.parse(latest)

        // TODO: Doesn't support multiple shadows
        if (shadow.length > 5) return original

        const template = complex.createTransformer(latest)
        const offset = typeof shadow[0] !== "number" ? 1 : 0

        // Calculate the overall context scale
        const xScale = projectionDelta!.x.scale * treeScale!.x
        const yScale = projectionDelta!.y.scale * treeScale!.y

        // Scale x/y
        ;(shadow[0 + offset] as number) /= xScale
        ;(shadow[1 + offset] as number) /= yScale

        /**
         * Ideally we'd correct x and y scales individually, but because blur and
         * spread apply to both we have to take a scale average and apply that instead.
         * We could potentially improve the outcome of this by incorporating the ratio between
         * the two scales.
         */
        const averageScale = mix(xScale, yScale, 0.5)

        // Blur
        if (typeof shadow[2 + offset] === "number")
            (shadow[2 + offset] as number) /= averageScale

        // Spread
        if (typeof shadow[3 + offset] === "number")
            (shadow[3 + offset] as number) /= averageScale

        let output = template(shadow)

        if (containsCSSVariables) {
            let i = 0
            output = output.replace(varToken, () => {
                const cssVariable = cssVariables[i]
                i++
                return cssVariable
            })
        }

        return output
    },
}
