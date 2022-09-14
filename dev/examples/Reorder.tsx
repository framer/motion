import * as React from "react"
import { Reorder } from "framer-motion"
import { useState } from "react"

export const App = () => {
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

    return (
        <div style={{ display: "flex" }}>
            <Reorder.Group
                style={{
                    display: "flex",
                    flexDirection: "row",
                    maxWidth: "500px",
                    flexWrap: "wrap",
                    marginRight: "50px",
                    flex: 1,
                }}
                as="div"
                values={verticalGridItems}
                onReorder={setVerticalGridItems}
            >
                {verticalGridItems.map((item) => (
                    <ReorderItem item={item} key={item} />
                ))}
            </Reorder.Group>
            <Reorder.Group
                style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "400px",
                    maxHeight: "250px",
                    flexWrap: "wrap",
                    marginRight: "50px",
                    flex: 1,
                }}
                as="div"
                values={horizontalGridItems}
                onReorder={setHorizontalGridItems}
            >
                {horizontalGridItems.map((item) => (
                    <ReorderItem item={item} key={item} />
                ))}
            </Reorder.Group>
            <Reorder.Group
                style={{
                    display: "flex",
                    marginRight: "50px",
                    flex: 1,
                }}
                values={horizontalItems}
                onReorder={setHorizontalItems}
            >
                {horizontalItems.map((item) => (
                    <ReorderItem item={item} key={item} />
                ))}
            </Reorder.Group>
            <Reorder.Group
                style={{
                    display: "flex",
                    flexDirection: "column",
                    marginRight: "50px",
                    flex: 1,
                }}
                values={verticalItems}
                onReorder={setVerticalItems}
            >
                {verticalItems.map((item) => (
                    <ReorderItem item={item} key={item} />
                ))}
            </Reorder.Group>
        </div>
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
