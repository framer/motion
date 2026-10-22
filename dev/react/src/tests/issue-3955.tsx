import { Reorder } from "framer-motion"
import { useState } from "react"

/**
 * #3955: a page-scrolling Reorder.Group, long enough that auto-scroll can
 * run for a few seconds without reaching the end of the page.
 */
const initialItems = Array.from({ length: 200 }, (_, i) => i)

export const App = () => {
    const [items, setItems] = useState(initialItems)

    return (
        <>
            <Reorder.Group axis="y" onReorder={setItems} values={items}>
                {items.map((item) => (
                    <Reorder.Item key={item} value={item} id={`item-${item}`}>
                        Item {item}
                    </Reorder.Item>
                ))}
            </Reorder.Group>
            <style>{styles}</style>
        </>
    )
}

const styles = `
body {
    margin: 0;
}

ul,
li {
    list-style: none;
    padding: 0;
    margin: 0;
}

ul {
    position: relative;
    width: 300px;
}

li {
    height: 50px;
    margin-bottom: 10px;
    border-radius: 5px;
    position: relative;
    background-color: #09f;
}
`
