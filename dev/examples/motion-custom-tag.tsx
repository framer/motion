import { motion } from "@framer"
import * as React from "react"

/**
 * An example of creating a `motion` version of a custom element. This will render <global> into the HTML
 */

export const App = () => {
    const CustomComponent = motion.custom("global")

    return (
        <CustomComponent
            data-testid="custom-element"
            style={{ width: 100, height: 100, background: "white" }}
        />
    )
}
