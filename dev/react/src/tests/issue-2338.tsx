import { AnimatePresence, motion } from "framer-motion"
import { useState } from "react"

/**
 * Reproduction for #2338 — the docs' "Shared layout animations" tabs
 * example, with a button that hides and shows the tabs. Showing them again
 * made the `layoutId="underline"` animate in from somewhere else.
 *
 * Query params:
 * - `hide` — how the tabs are hidden: `unmount` (default) stops rendering
 *   them, `display` sets `display: none` on the window.
 * - `duration` — seconds for the linear layout transition (default 4).
 */

const params = new URLSearchParams(window.location.search)
const hide = params.get("hide") ?? "unmount"
const duration = Number(params.get("duration") ?? 4)

const tabs = [
    { icon: "🍅", label: "Tomato" },
    { icon: "🥬", label: "Lettuce" },
    { icon: "🧀", label: "Cheese" },
]

const Tabs = () => {
    const [selectedTab, setSelectedTab] = useState(tabs[0])

    return (
        <>
            <nav>
                <ul
                    style={{
                        display: "flex",
                        listStyle: "none",
                        padding: 0,
                        margin: 0,
                    }}
                >
                    {tabs.map((item) => (
                        <li
                            key={item.label}
                            id={`tab-${item.label}`}
                            onClick={() => setSelectedTab(item)}
                            style={{
                                position: "relative",
                                flex: 1,
                                padding: "10px 15px",
                                cursor: "pointer",
                            }}
                        >
                            {`${item.icon} ${item.label}`}
                            {item === selectedTab ? (
                                <motion.div
                                    id="underline"
                                    layoutId="underline"
                                    transition={{
                                        type: "tween",
                                        ease: "linear",
                                        duration,
                                    }}
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
            <main style={{ height: 200, fontSize: 128 }}>
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
        </>
    )
}

export const App = () => {
    const [isVisible, setIsVisible] = useState(true)

    return (
        <div style={{ padding: 40 }}>
            <button id="toggle" onClick={() => setIsVisible(!isVisible)}>
                Toggle Visible
            </button>
            {hide === "display" ? (
                <div
                    id="window"
                    style={{
                        width: 480,
                        display: isVisible ? "block" : "none",
                    }}
                >
                    <Tabs />
                </div>
            ) : (
                isVisible && (
                    <div id="window" style={{ width: 480 }}>
                        <Tabs />
                    </div>
                )
            )}
        </div>
    )
}
