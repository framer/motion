import { AnimatePresence, LayoutGroup, motion } from "framer-motion"
import { useEffect, useState } from "react"

/**
 * Issue #2338: the docs' "Shared layout animations" tabs example, inside a
 * LayoutGroup, with a "Toggle visible" button that unmounts and remounts the
 * tab bar. Re-showing the tab bar should render the underline in place, not
 * animate it in from where it was before.
 *
 * Every frame's underline box is recorded to window.frames by a rAF loop, and
 * window.shownAt holds the frame index at which the tab bar was re-shown.
 * ?move=true moves the tab bar while it's hidden (as when other content
 * shifts), so a stale animation would start somewhere else on the page.
 * ?display=true hides the tab bar with display: none instead of unmounting
 * it. Until 12.0.6 the underline's snapshot of its display: none box (0x0 at
 * the viewport's top-left) was kept, so on re-show it grew out of the corner.
 */
const tabs = [
    { icon: "🍅", label: "Tomato" },
    { icon: "🥬", label: "Lettuce" },
    { icon: "🧀", label: "Cheese" },
]

const params = new URLSearchParams(window.location.search)
const move = params.get("move")
const display = params.get("display")

const record = () => {
    const w = window as any
    w.frames = []
    let id = 0
    const tick = () => {
        const underline = document.getElementById("underline")
        if (underline) {
            const { x, y, width } = underline.getBoundingClientRect()
            w.frames.push({ x, y, width })
        } else {
            w.frames.push(null)
        }
        id = requestAnimationFrame(tick)
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
}

export const App = () => {
    const [selectedTab, setSelectedTab] = useState(tabs[0])
    const [isVisible, setIsVisible] = useState(true)

    useEffect(record, [])

    return (
        <LayoutGroup>
            <button
                id="toggle"
                onClick={() => {
                    if (!isVisible) {
                        ;(window as any).shownAt = (window as any).frames.length
                    }
                    setIsVisible(!isVisible)
                }}
            >
                Toggle visible
            </button>
            {move && !isVisible && <div style={{ height: 200 }} />}
            {(display || isVisible) && (
                <div
                    style={{
                        display: isVisible ? "flex" : "none",
                        width: 480,
                        height: 360,
                        borderRadius: 10,
                        background: "white",
                        overflow: "hidden",
                        boxShadow: "0 1px 1px hsl(0deg 0% 0% / 0.075)",
                        flexDirection: "column",
                    }}
                >
                    <nav
                        style={{
                            background: "#fdfdfd",
                            padding: "5px 5px 0",
                            borderBottom: "1px solid #eeeeee",
                            height: 44,
                        }}
                    >
                        <ul
                            style={{
                                listStyle: "none",
                                padding: 0,
                                margin: 0,
                                display: "flex",
                                width: "100%",
                            }}
                        >
                            {tabs.map((item) => (
                                <li
                                    key={item.label}
                                    id={item.label}
                                    onClick={() => setSelectedTab(item)}
                                    style={{
                                        position: "relative",
                                        flex: 1,
                                        height: 24,
                                        padding: "10px 15px",
                                        cursor: "pointer",
                                    }}
                                >
                                    {`${item.icon} ${item.label}`}
                                    {item === selectedTab ? (
                                        <motion.div
                                            id="underline"
                                            layoutId="underline"
                                            style={{
                                                position: "absolute",
                                                bottom: -1,
                                                left: 0,
                                                right: 0,
                                                height: 2,
                                                background: "#8855ff",
                                            }}
                                        />
                                    ) : null}
                                </li>
                            ))}
                        </ul>
                    </nav>
                    <main
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            flex: 1,
                            fontSize: 128,
                        }}
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedTab.label}
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -10, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                {selectedTab.icon}
                            </motion.div>
                        </AnimatePresence>
                    </main>
                </div>
            )}
        </LayoutGroup>
    )
}
