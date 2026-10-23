import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useState } from "react"

/**
 * Repro for #2261: with Electron's `webSecurity: false` (Chromium's
 * --disable-web-security), animations were reported to start ~400ms late
 * and run slowly. Mirrors the reporter's app: a button wrapped in a
 * motion.div that slides on x, and a popover entering with opacity + y.
 *
 * Every frame after the click is recorded in the page, so the spec can
 * check when the animations start and finish without sampling from the
 * test runner.
 */
interface Recording {
    clickAt: number | null
    frames: [number, string, string | null][]
}

declare global {
    interface Window {
        recording: Recording
    }
}

export const App = () => {
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        const recording: Recording = (window.recording = {
            clickAt: null,
            frames: [],
        })
        let id: number
        const record = () => {
            if (recording.clickAt !== null) {
                const popover = document.getElementById("popover")
                recording.frames.push([
                    performance.now() - recording.clickAt,
                    getComputedStyle(document.getElementById("box")!).transform,
                    popover && getComputedStyle(popover).opacity,
                ])
            }
            id = requestAnimationFrame(record)
        }
        id = requestAnimationFrame(record)
        return () => cancelAnimationFrame(id)
    }, [])

    return (
        <div style={{ padding: 20 }}>
            <motion.div id="box" animate={{ x: isOpen ? 100 : 0 }}>
                <button
                    id="toggle"
                    onPointerDown={() => {
                        window.recording.clickAt = performance.now()
                    }}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    Click me
                </button>
            </motion.div>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        id="popover"
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 10, opacity: 0 }}
                        transition={{ ease: "easeInOut" }}
                        style={{
                            width: 200,
                            height: 200,
                            background: "blue",
                            willChange: "transform, opacity",
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}
