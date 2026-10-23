import { motion } from "framer-motion"
import { useEffect, useState } from "react"

/**
 * Issue #2369: backgroundColor set via CSS variables, alongside a spring on
 * another value (scale). On mount, scale springs slowly to 1.5 and the
 * background stays at var(--off). 300ms in, the background animates to
 * var(--on) and finishes long before the spring. When the spring settled,
 * the background used to jump back to var(--off).
 *
 * ?literal=true uses plain colors instead of CSS variables (control).
 */
export const App = () => {
    const literal = new URLSearchParams(window.location.search).get("literal")
    const [on, setOn] = useState(false)

    useEffect(() => {
        const el = document.getElementById("box")!
        const frames: string[] = ((window as any).frames = [])
        let id = requestAnimationFrame(function loop() {
            frames.push(getComputedStyle(el).backgroundColor)
            id = requestAnimationFrame(loop)
        })
        const timeout = setTimeout(() => setOn(true), 300)
        return () => {
            cancelAnimationFrame(id)
            clearTimeout(timeout)
        }
    }, [])

    const off = literal ? "#ff0000" : "var(--off)"

    return (
        <motion.div
            id="box"
            style={
                {
                    width: 100,
                    height: 100,
                    "--off": "#ff0000",
                    "--on": "#0000ff",
                } as any
            }
            initial={{ scale: 1, backgroundColor: off }}
            animate={{
                scale: 1.5,
                backgroundColor: on ? (literal ? "#0000ff" : "var(--on)") : off,
            }}
            transition={{
                type: "spring",
                stiffness: 100,
                damping: 5,
                backgroundColor: { duration: 0.2 },
            }}
        />
    )
}
