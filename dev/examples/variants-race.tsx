import * as React from "react"
import { useState } from "react"
import { motion } from "framer-motion"

export const App = function () {
    const [isHover, setIsHover] = useState(false)
    const [isPressed, setIsPressed] = useState(false)
    const [variant, setVariant] = useState("a")

    const variants = [variant]
    if (isHover) variants.push(variant + "-hover")

    //! Uncommenting the next line makes it work.
    // if (isPressed) variants.push(variant + "-pressed")
    console.log(variants)
    return (
        <motion.div
            animate={variants}
            onHoverStart={() => setIsHover(true)}
            onHoverEnd={() => setIsHover(false)}
            // onTapStart={() => setIsPressed(true)}
            // onTap={() => setIsPressed(false)}
            onTapCancel={() => setIsPressed(false)}
        >
            <motion.div
                onTap={() => setVariant("b")}
                style={{
                    width: 300,
                    height: 300,
                    backgroundColor: "rgba(255,255,0)",
                }}
                variants={{
                    b: {
                        backgroundColor: "rgba(0,255,255)",
                    },
                }}
            >
                <motion.div
                    id="inner"
                    style={{
                        width: 100,
                        height: 100,
                        backgroundColor: "rgba(255,255,0)",
                    }}
                    variants={{
                        // This state lingers too long.
                        "a-hover": {
                            backgroundColor: "rgba(150,150,0)",
                        },
                        b: {
                            backgroundColor: "rgba(0,255,255)",
                        },
                        "b-hover": {
                            backgroundColor: "rgb(0, 150,150)",
                        },
                    }}
                />
            </motion.div>
        </motion.div>
    )
}
