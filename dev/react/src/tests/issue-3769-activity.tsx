import { motion, useMotionValue, useTransform } from "framer-motion"
import * as React from "react"
import { useEffect, useState } from "react"

/**
 * #3769: hiding an <Activity> runs the cleanup of its subtree's effects, and
 * revealing it re-runs them without re-rendering. A source set while hidden
 * should still reach a useTransform value once it's visible again.
 *
 * <Activity> needs React 19.2+. The React 18 app renders #unsupported.
 */
const { Activity } = React as any

function Probe() {
    const x = useMotionValue(0)
    const doubled = useTransform(() => x.get() * 2)
    ;(window as any).probeRenders = ((window as any).probeRenders || 0) + 1

    useEffect(() => {
        ;(window as any).probe = { x, doubled }
    }, [])

    return <motion.div id="probe">{doubled}</motion.div>
}

/**
 * Created once so revealing re-runs Probe's effects without a render.
 */
const probe = <Probe />

export const App = () => {
    const [mode, setMode] = useState("visible")

    if (!Activity) return <div id="unsupported" />

    return (
        <>
            <button id="hide" onClick={() => setMode("hidden")}>
                Hide
            </button>
            <button id="show" onClick={() => setMode("visible")}>
                Show
            </button>
            <Activity mode={mode}>{probe}</Activity>
        </>
    )
}
