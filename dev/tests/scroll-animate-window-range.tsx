import { scroll, animate } from "framer-motion"
import * as React from "react"
import { useEffect } from "react"

export const App = () => {
    const params = new URLSearchParams(window.location.search)
    const rangeStart = params.get("rangeStart") || "100px"
    const rangeEnd = params.get("rangeEnd") || "100%"

    useEffect(() => {
        /**
         * Animate both background-color (WAAPI-driven) and color (sync)
         */
        return scroll(
            animate(
                "#color",
                {
                    backgroundColor: ["#fff", "#000"],
                    color: ["#000", "#fff"],
                    transform: [
                        "none",
                        "translateX(50px)",
                        "translateX(100px)",
                    ],
                },
                { ease: "linear" }
            ),
            {
                range: [rangeStart, rangeEnd],
            }
        )
    }, [])

    return (
        <>
            <div style={{ ...spacer, backgroundColor: "red" }}>
                <div
                    style={{
                        ...progressStyle,
                        marginLeft: 100,
                        position: "static",
                        background: "white",
                    }}
                ></div>
            </div>
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
