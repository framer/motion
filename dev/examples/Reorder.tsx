import * as React from "react"
import { Reorder } from "framer-motion"
import {useRef, useState} from "react"

export const App = () => {
    const externalRef = useRef<HTMLElement>()
    const [verticalGridItems, setVerticalGridItems] = useState([
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
        20, 21, 22, 23, 24, 25, 26,
    ])
    const [horizontalGridItems, setHorizontalGridItems] = useState([
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
    ])
    const [verticalItems, setVerticalItems] = useState([0, 1, 2, 3, 4])
    const [horizontalItems, setHorizontalItems] = useState([
        0, 1, 2, 3, 4, 5, 6,
    ])

    const [reorderType, setReorderType] = useState("row-grid")

    const reorder = {
        "row-grid": (
            <Reorder.Group
                style={{
                    display: "flex",
                    flexDirection: "row",
                    maxWidth: "500px",
                    flexWrap: "wrap",
                    flex: 1,
                }}
                ref={externalRef}
                as="div"
                values={verticalGridItems}
                onReorder={setVerticalGridItems}
            >
                {verticalGridItems.map((item) => (
                    <ReorderItem item={item} key={item} />
                ))}
            </Reorder.Group>
        ),
        "column-grid": (
            <Reorder.Group
                style={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100vh",
                    maxHeight: "400px",
                    flexWrap: "wrap",
                    flex: 0,
                }}
                as="div"
                values={horizontalGridItems}
                onReorder={setHorizontalGridItems}
            >
                {horizontalGridItems.map((item) => (
                    <ReorderItem item={item} key={item} />
                ))}
            </Reorder.Group>
        ),
        row: (
            <Reorder.Group
                style={{
                    display: "flex",
                    flex: 1,
                }}
                values={horizontalItems}
                onReorder={setHorizontalItems}
            >
                {horizontalItems.map((item) => (
                    <ReorderItem item={item} key={item} />
                ))}
            </Reorder.Group>
        ),
        column: (
            <Reorder.Group
                style={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                }}
                values={verticalItems}
                onReorder={setVerticalItems}
            >
                {verticalItems.map((item) => (
                    <ReorderItem item={item} key={item} />
                ))}
            </Reorder.Group>
        ),
    }

    return (
        <>
            <div>
                <div style={{ display: "flex", gap: "50px" }}>
                    {reorder[reorderType]}
                </div>
            </div>
            <div
                style={{
                    display: "flex",
                    position: "absolute",
                    bottom: 0,
                    justifyContent: "center",
                }}
            >
                <button onClick={() => setReorderType("row-grid")}>
                    Row Grid
                </button>
                <button onClick={() => setReorderType("column-grid")}>
                    Column Grid
                </button>
                <button onClick={() => setReorderType("row")}>Row</button>
                <button onClick={() => setReorderType("column")}>Column</button>
            </div>
        </>
    )
}

const ReorderItem = ({ item }: { item: number }) => (
    <Reorder.Item
        as="div"
        style={{
            backgroundColor: "white",
            width: "50px",
            height: "50px",
            margin: "10px",
        }}
        key={item}
        value={item}
    >
        {item}
    </Reorder.Item>
)
