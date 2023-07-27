import { scroll, frameData } from "framer-motion"
import * as React from "react"
import { useEffect, useState } from "react"

export const App = () => {
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState("")

    useEffect(() => {
        let prevFrameStamp = 0

        return scroll((p) => {
            setProgress(p)

            if (prevFrameStamp === frameData.timestamp) {
                setError("Concurrent event handlers detected")
            }

            prevFrameStamp = frameData.timestamp
        })
    }, [])

    return (
        <>
            <div style={{ ...spacer, backgroundColor: "red" }} />
            <div style={{ ...spacer, backgroundColor: "green" }} />
            <div style={{ ...spacer, backgroundColor: "blue" }} />
            <div style={{ ...spacer, backgroundColor: "yellow" }} />
            <div id="progress" style={progressStyle}>
                {progress}
            </div>
            <div id="error" style={errorStyle}>
                {error}
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
}

const errorStyle: React.CSSProperties = {
    position: "fixed",
    bottom: 0,
    left: 0,
}
