import * as React from "react"
import { useEffect } from "react"
import { motion } from "@framer"

const style = {
    width: 100,
    height: 100,
    background: "var(--from)",
}

export const App = () => {
    const transition = {
        type: "tween",
        ease: "anticipate",
        duration: 1,
    }

    const ref = React.useRef<HTMLDivElement>(null)
    useEffect(() => {
        function changeToVar() {
            ref.current.style.setProperty("--to", "cyan")
        }
        const timer = setTimeout(changeToVar, 2000)
        return () => clearTimeout(timer)
    })

    return (
        <div style={{ "--from": "#09F", "--to": "#F00" } as any} ref={ref}>
            <motion.div
                animate={{
                    background: "var(--to)",
                    // transitionEnd: { background: "var(--to)" },
                }}
                transition={transition}
                style={style}
            />
        </div>
    )
}
