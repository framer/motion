import { scroll } from "framer-motion"
import * as React from "react"
import { useEffect, useState } from "react"

export const App = () => {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        scroll(setProgress, { axis: "x" })
    }, [])

    return (
        <div style={{ width: "400vw", display: "flex", flexDirection: "row" }}>
            <div style={{ ...spacer, backgroundColor: "red" }} />
            <div style={{ ...spacer, backgroundColor: "green" }} />
            <div style={{ ...spacer, backgroundColor: "blue" }} />
            <div style={{ ...spacer, backgroundColor: "yellow" }} />
            <div id="progress" style={progressStyle}>
                {progress}
            </div>
            <style>{styles}</style>
        </div>
    )
}

const spacer = {
    width: "100vw",
    height: 500,
}

const progressStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
}

const styles = `
  body {
    overflow-x: scroll!important;
    overflow-y: hidden;
  }
`
