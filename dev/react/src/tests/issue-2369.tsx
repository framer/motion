import { motion, useMotionValue } from "framer-motion"
import { useEffect } from "react"

/**
 * #2369: backgroundColor animates to CSS variables on hover and tap, and
 * scale animates with a spring. The background shouldn't jump back to the
 * hover colour when the hover's scale spring finishes mid-press.
 */
export const App = () => {
    const scale = useMotionValue(1)

    useEffect(
        () =>
            scale.on("animationComplete", () => {
                ;(window as any).scaleAnimationComplete = true
            }),
        [scale]
    )

    return (
        <div
            style={
                {
                    "--teal": "rgb(0, 128, 128)",
                    "--blue": "rgb(0, 0, 255)",
                    "--green": "rgb(0, 255, 0)",
                    padding: 50,
                } as React.CSSProperties
            }
        >
            <motion.button
                id="box"
                style={{
                    width: 100,
                    height: 100,
                    scale,
                    backgroundColor: "var(--teal)",
                }}
                whileHover={{ scale: 1.2, backgroundColor: "var(--blue)" }}
                whileTap={{ backgroundColor: "var(--green)" }}
                transition={{ scale: { type: "spring" } }}
            >
                Click me
            </motion.button>
        </div>
    )
}
