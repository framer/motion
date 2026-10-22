import { Reorder } from "framer-motion"
import { useState } from "react"

/**
 * Reorder items that contain their own controls: a checkbox (in a label), a
 * button and a link. The items' tab stops and keyboard reordering mustn't
 * change how those controls behave. The page is tall enough to scroll.
 */
export const App = () => {
    const [items, setItems] = useState(["a", "b", "c"])
    const [checked, setChecked] = useState<string[]>([])
    const [clicks, setClicks] = useState(0)

    return (
        <>
            <div id="order">{items.join(",")}</div>
            <div id="checked">{checked.join(",")}</div>
            <div id="clicks">{clicks}</div>
            <div style={{ height: 500 }} />
            <Reorder.Group
                values={items}
                onReorder={setItems}
                style={{ listStyle: "none", padding: 0 }}
            >
                {items.map((item) => (
                    <Reorder.Item
                        key={item}
                        value={item}
                        id={item}
                        transition={{ duration: 0 }}
                        whileDrag={{ opacity: 0.5 }}
                        style={{ height: 60, background: "#eee" }}
                    >
                        <span id={`${item}-text`}>{item}</span>
                        <label>
                            <input
                                type="checkbox"
                                id={`${item}-checkbox`}
                                checked={checked.includes(item)}
                                onChange={() =>
                                    setChecked((c) =>
                                        c.includes(item)
                                            ? c.filter((v) => v !== item)
                                            : [...c, item]
                                    )
                                }
                            />
                            <span id={`${item}-label`}>done</span>
                        </label>
                        <button
                            id={`${item}-button`}
                            onClick={() => setClicks((n) => n + 1)}
                        >
                            edit
                        </button>
                        <a id={`${item}-link`} href="#link">
                            link
                        </a>
                    </Reorder.Item>
                ))}
            </Reorder.Group>
            <div style={{ height: 3000 }} />
        </>
    )
}
