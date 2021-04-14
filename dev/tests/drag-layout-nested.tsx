import { motion } from "@framer"
import * as React from "react"

export const App = () => {
    const [count, setCount] = React.useState(0)
    const params = new URLSearchParams(window.location.search)
    const parentDrag = params.get("parentDrag") || true
    const childDrag = params.get("childDrag") || true
    const parentLayout = params.get("parentLayout") ? true : undefined
    const childLayout = params.get("childLayout") ? true : undefined
    const constraints = Boolean(params.get("constraints"))

    // Trigger layout projection in the child
    React.useEffect(() => {
        setCount(count + 1)
    }, [])

    return (
        <div>
            <motion.div
                id="parent"
                drag={parentDrag}
                dragMomentum={false}
                dragElastic={false}
                dragConstraints={constraints && { top: -10, right: 100 }}
                layout={parentLayout}
                style={b}
            >
                <motion.div
                    id="child"
                    drag={childDrag}
                    dragMomentum={false}
                    dragElastic={false}
                    dragConstraints={
                        constraints && { top: 0, left: -100, right: 100 }
                    }
                    layout={childLayout}
                    style={a}
                />
            </motion.div>
        </div>
    )
}

const box = {
    position: "absolute",
    top: 0,
    left: 0,
    background: "#ff0055",
}

const b = {
    ...box,
    top: 100,
    left: 100,
    width: 300,
    height: 300,
    borderRadius: 10,
}

const a = {
    position: "relative",
    top: 50,
    left: 50,
    width: 600,
    height: 200,
    background: "#ffcc00",
    borderRadius: 10,
}
