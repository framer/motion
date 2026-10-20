import { motion } from "framer-motion"
import * as React from "react"
import { useMemo, useState } from "react"

/**
 * #3942: a motion component first mounted inside a hidden <Activity> should
 * animate to the `animate` value of its latest render when revealed, not
 * the one from its first render.
 *
 * #rerender re-renders when the Activity is revealed. #memo is memoized, so
 * revealing it only re-runs its effects.
 *
 * <Activity> needs React 19.2+. The React 18 app renders #unsupported.
 */
const { Activity } = React as any

const transition = { duration: 0.1 }

function Box({ id, active }: { id: string; active: boolean }) {
    return (
        <motion.div
            id={id}
            initial={{ opacity: 0 }}
            animate={{ opacity: active ? 1 : 0 }}
            transition={transition}
            style={{ width: 100, height: 100, background: "red" }}
        />
    )
}

export const App = () => {
    const [shown, setShown] = useState(false)
    const [active, setActive] = useState(false)
    const memo = useMemo(() => <Box id="memo" active={active} />, [active])

    if (!Activity) return <div id="unsupported" />

    const mode = shown ? "visible" : "hidden"

    return (
        <>
            <button id="toggle-shown" onClick={() => setShown(!shown)}>
                Toggle shown
            </button>
            <button id="toggle-active" onClick={() => setActive(!active)}>
                Toggle active
            </button>
            <Activity mode={mode}>
                <Box id="rerender" active={active} />
            </Activity>
            <Activity mode={mode}>{memo}</Activity>
        </>
    )
}
