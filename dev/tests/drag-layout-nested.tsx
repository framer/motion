import { motion } from "@framer"
import * as React from "react"

export const App = () => {
    const [count, setCount] = React.useState(0)
    const params = new URLSearchParams(window.location.search)
    const parentDrag = params.get("parentDrag") || true
    const childDrag = params.get("childDrag") || true
    const parentLayout = params.get("parentLayout") ? true : undefined
    const childLayout = params.get("childLayout") ? true : undefined

    // Trigger layout projection in the child
    React.useEffect(() => {
        setCount(count + 1)
    }, [])
    console.log(parentLayout, childLayout)
    return (
        <motion.div
            id="parent"
            drag={parentDrag}
            dragMomentum={false}
            layout={parentLayout}
            style={b}
        >
            <motion.div
                id="child"
                drag={childDrag}
                dragMomentum={false}
                layout={childLayout}
                style={a}
            />
        </motion.div>
    )
}

const box = {
    position: "absolute",
    top: 0,
    left: 0,
    background: "red",
}

const b = {
    ...box,
    top: 100,
    left: 200,
    width: 300,
    height: 300,
}

const a = {
    position: "relative",
    top: 50,
    left: 50,
    width: 600,
    height: 200,
    background: "blue",
}
