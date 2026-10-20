import { motion } from "framer-motion"
import { useState } from "react"

/**
 * Reproduction for #2514 — a `layoutId` indicator is mispositioned when the
 * underlying children's height adjusts.
 *
 * #2514 reports that the `originX: 0` workaround quoted in #1972 only rescues
 * one axis, and asks for the vertically stacked case: nav buttons in a column
 * with a shared `layoutId` indicator, where selecting an item also changes the
 * height of the surrounding content.
 *
 * The structure that matters is that the height change happens in content
 * *before* the nav in flow, so the whole nav is displaced on the y axis by the
 * same update that moves the indicator. The indicator therefore has to animate
 * on both axes at once (x within the nav for a row, y for the displacement),
 * which is the combination the `originX`/`originY` workaround can't cover.
 *
 * Query params:
 * - `duration` — seconds for the linear layout transition (default 4).
 * - `vertical` — `0` for a row of tabs, `1` (default) for a column.
 * - `mode` — `below` (default): the resizing content precedes the nav, so the
 *   nav is displaced. `flow`: nav first, content after — control case, the nav
 *   doesn't move.
 * - `indicator` — `bar` (default) for a thin underline, `full` to fill the item.
 * - `originY` — `1` to apply the `style={{ originY: 0 }}` workaround.
 * - `axis` — `y` or `x` to use the `layout="y"`/`layout="x"` axis constraint
 *   added by PR #3627 (which closed #1972).
 * - `navLayout` — `1` to make the nav itself a `layout` component, so it
 *   animates its own displacement and the indicator should stay attached.
 */

const params = new URLSearchParams(window.location.search)
const duration = Number(params.get("duration") ?? 4)
const vertical = params.get("vertical") !== "0"
const mode = params.get("mode") ?? "below"
const isBar = params.get("indicator") !== "full"
const useOriginY = params.get("originY") === "1"
const axis = params.get("axis")
const navLayout = params.get("navLayout") === "1"

const items = [
    { id: "a", label: "One", content: 100 },
    { id: "b", label: "Two", content: 250 },
    { id: "c", label: "Three", content: 400 },
]

export const App = () => {
    const [selected, setSelected] = useState("a")
    const active = items.find((item) => item.id === selected)!

    const transition = { type: "tween" as const, ease: "linear" as const, duration }

    const nav = (
        <motion.div
            id="nav"
            layout={navLayout}
            transition={transition}
            style={{
                display: "flex",
                flexDirection: vertical ? "column" : "row",
                gap: 8,
                alignItems: "flex-start",
            }}
        >
            {items.map((item) => (
                <button
                    key={item.id}
                    id={`item-${item.id}`}
                    onClick={() => setSelected(item.id)}
                    style={{
                        position: "relative",
                        padding: "12px 20px",
                        border: "none",
                        background: "transparent",
                        font: "inherit",
                        cursor: "pointer",
                    }}
                >
                    {item.label}
                    {selected === item.id && (
                        <motion.div
                            id="indicator"
                            layoutId="indicator"
                            layout={(axis as any) ?? true}
                            style={{
                                position: "absolute",
                                left: 0,
                                right: 0,
                                bottom: 0,
                                ...(isBar ? { height: 4 } : { top: 0 }),
                                background: "#f00",
                                ...(useOriginY ? { originY: 0 } : {}),
                            }}
                            transition={transition}
                        />
                    )}
                </button>
            ))}
        </motion.div>
    )

    const content = (
        <div
            id="content"
            style={{ height: active.content, background: "#eee" }}
        >
            content {active.content}
        </div>
    )

    return (
        <div>
            {mode === "below" ? (
                <>
                    {content}
                    {nav}
                </>
            ) : (
                <>
                    {nav}
                    {content}
                </>
            )}
        </div>
    )
}
