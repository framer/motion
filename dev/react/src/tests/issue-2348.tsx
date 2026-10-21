import { AnimatePresence, motion } from "framer-motion"
import { useRef, useState } from "react"

/**
 * Issue #2348: popLayout position incorrectly calculated.
 *
 * Reporter's sandbox (a fork of the official "AnimatePresence popLayout mode"
 * example) with toggles for `popLayout` and a `fixed` class on the `ul`. With
 * both on, an exiting item should shrink towards its own centre, not drop.
 *
 * The issue says the bug is invisible when the fixed container's top is
 * aligned with the window's top, so `?anchor=` positions the fixed `ul`
 * offset from the top, in the bottom-right corner (toast list) or centred
 * with a percentage transform. The `?fixed` and `?popLayout` params preset
 * the checkboxes. `?scroll` puts a tall spacer above the list, so removing
 * an item from the bottom of a scrolled page shrinks the document.
 */
const params = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
)
const anchor = params.get("anchor") || "top"

/**
 * Optional, for checking the `anchorY` prop (added after this issue was
 * filed) against the same repro.
 */
const anchorY = (params.get("anchorY") || undefined) as
    | "top"
    | "bottom"
    | undefined

const fixedStyle = {
    top: "position: fixed; top: 200px; left: 200px;",
    bottom: "position: fixed; bottom: 20px; right: 20px;",
    center: "position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);",
}[anchor]

function removeItem<T>(arr: T[], item: T) {
    const index = arr.indexOf(item)
    if (index > -1) arr.splice(index, 1)
}

export const App = () => {
    const count = useRef(0)
    const [items, setItems] = useState([0])
    const [popLayout, setPopLayout] = useState(params.has("popLayout"))
    const [isFixed, setIsFixed] = useState(params.has("fixed"))

    return (
        <div className="example">
            <style>{`
                .example ul {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    list-style: none;
                    margin: 0;
                    padding: 0;
                    width: 150px;
                }
                .example li {
                    display: block;
                    width: 150px;
                    height: 60px;
                    border-radius: 10px;
                    background: #ff0088;
                }
                .example ul.fixed { ${fixedStyle} }
            `}</style>
            <div className="controls">
                <label className="enable">
                    <code>popLayout</code>
                    <input
                        id="pop-layout"
                        type="checkbox"
                        checked={popLayout}
                        onChange={(e) => setPopLayout(e.currentTarget.checked)}
                    />
                </label>
                <label className="enable">
                    <code>fixed</code>
                    <input
                        id="fixed"
                        type="checkbox"
                        checked={isFixed}
                        onChange={(e) => setIsFixed(e.currentTarget.checked)}
                    />
                </label>
                <motion.button
                    id="add"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        count.current++
                        setItems([...items, count.current])
                    }}
                >
                    Add item
                </motion.button>
                <button
                    id="cycle"
                    onClick={() => {
                        count.current++
                        setItems([...items.slice(1), count.current])
                    }}
                >
                    Remove first, add item
                </button>
            </div>
            {params.has("scroll") && <div style={{ height: 2000 }} />}
            <ul className={isFixed ? "fixed" : ""}>
                <AnimatePresence
                    mode={popLayout ? "popLayout" : "sync"}
                    anchorY={anchorY}
                >
                    {items.map((id) => (
                        <motion.li
                            id={`item-${id}`}
                            layout
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: "spring" }}
                            key={id}
                            onClick={() => {
                                const newItems = [...items]
                                removeItem(newItems, id)
                                setItems(newItems)
                            }}
                        />
                    ))}
                </AnimatePresence>
            </ul>
        </div>
    )
}
