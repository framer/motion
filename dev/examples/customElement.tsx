import { motion } from "@framer"
import * as React from "react"

export const App = () => {
    const CustomComponent = motion.custom("global")

    return (
        <CustomComponent
            data-testid="custom-element"
            style={{ width: 100, height: 100, background: "red" }}
        />
    )
}
