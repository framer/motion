import { Reorder } from "framer-motion"
import { useState } from "react"

/**
 * #2658: keyboard accessible reordering. `?axis=x` lays the items out in a
 * row, `?rtl` flips it, `?layout` animates the reorder.
 */
export const App = () => {
    const params = new URL(window.location.href).searchParams
    const axis = params.get("axis") === "x" ? "x" : "y"
    const [items, setItems] = useState(["a", "b", "c", "d"])

    return (
        <>
            <button id="before">before</button>
            <div id="order">{items.join(",")}</div>
            <Reorder.Group
                axis={axis}
                values={items}
                onReorder={setItems}
                style={{
                    display: "flex",
                    flexDirection: axis === "x" ? "row" : "column",
                    direction: params.has("rtl") ? "rtl" : "ltr",
                    gap: 10,
                    listStyle: "none",
                    padding: 0,
                }}
            >
                {items.map((item) => (
                    <Reorder.Item
                        key={item}
                        value={item}
                        id={item}
                        transition={
                            params.has("layout")
                                ? { duration: 1, ease: "linear" }
                                : { duration: 0 }
                        }
                        style={{
                            width: 80,
                            height: 40,
                            background: "#eee",
                        }}
                    >
                        {item}
                        <input id={`${item}-input`} style={{ width: 30 }} />
                    </Reorder.Item>
                ))}
            </Reorder.Group>
        </>
    )
}
