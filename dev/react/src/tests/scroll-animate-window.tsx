import { scroll, animate, animateMini } from "framer-motion"
import * as React from "react"
import { useEffect } from "react"

export const App = () => {
    useEffect(() => {
        const stopScrollAnimation = scroll(
            animate(
                "#color",
                { x: [0, 100], backgroundColor: ["#fff", "#000"] },
                { ease: "linear" }
            )
        )

        const stopMiniScrollAnimation = scroll(
            animateMini(
                "#color",
                {
                    color: ["#000", "#fff"],
                },
                { ease: "linear" }
            )
        )

        return () => {
            stopScrollAnimation()
            stopMiniScrollAnimation()
        }
    }, [])

    return (
        <>
            <div style={{ ...spacer, backgroundColor: "red" }} />
            <div style={{ ...spacer, backgroundColor: "green" }} />
            <div style={{ ...spacer, backgroundColor: "blue" }} />
            <div style={{ ...spacer, backgroundColor: "yellow" }} />
            <div id="color" style={progressStyle}>
                A
            </div>
        </>
    )
}

const spacer = {
    height: "100vh",
}

const progressStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    width: 100,
    height: 100,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 80,
    lineHeight: 80,
    fontWeight: "bold",
}
