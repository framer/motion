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
        <div ref={ref}>
            <motion.div
                initial={{
                    background: `var(--token-31a8b72b-4f05-4fb3-b778-63a7fb0d9454, hsl(224, 78%, 54%)) /* {"name":"Midnight Blue"} */`,
                }}
                animate={{
                    background: `var(--token-666a5765-0e05-4d0e-b396-a6c555d9cdb3, hsl(125, 74%, 43%)) /* {"name":"Goblin Green"} */`,
                }}
                transition={transition}
                style={style}
            />
        </div>
    )
}
