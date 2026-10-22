import { domMax, LazyMotion, m, Reorder } from "framer-motion"
import { useState } from "react"

/**
 * #2094: the whole app is wrapped in <LazyMotion strict> and one page renders
 * the main Reorder.Group + Reorder.Item, which render `motion` components.
 * ?features=async loads domMax lazily, as in the reporter's repro.
 */
export const App = () => {
    const params = new URLSearchParams(window.location.search)
    const [items, setItems] = useState([0, 1, 2])

    return (
        <LazyMotion
            strict
            features={
                params.get("features") === "async"
                    ? () => import("framer-motion").then((mod) => mod.domMax)
                    : domMax
            }
        >
            <m.div id="m-sibling" animate={{ opacity: 1 }} />
            <Reorder.Group
                axis="y"
                values={items}
                onReorder={setItems}
                style={{ listStyle: "none", margin: 0, padding: 0 }}
            >
                {items.map((item) => (
                    <Reorder.Item
                        key={item}
                        value={item}
                        id={`item-${item}`}
                        style={{
                            height: 50,
                            width: 200,
                            marginBottom: 10,
                            background: "red",
                        }}
                    >
                        {item}
                    </Reorder.Item>
                ))}
            </Reorder.Group>
        </LazyMotion>
    )
}
