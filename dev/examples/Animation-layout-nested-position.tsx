import * as React from "react"
import { motion, useCycle } from "framer-motion"

/**
 * This example demonstrates that nested components automatically factor in parent size deltas
 */
const transition = { duration: 3, ease: "circIn" }

export const App = () => {
    const [isOpen, toggleIsOpen] = useCycle(true, false)
    const childStyles = isOpen ? openChild : closedChild
    return (
        <motion.div
            layout
            transition={transition}
            style={isOpen ? openParent : closedParent}
            onClick={() => toggleIsOpen()}
            onLayoutAnimationComplete={() => console.log("complete")}
            id="parent"
        >
            {/* {!isOpen && (
                <motion.div
                    layout
                    style={{
                        ...childStyles,
                        height: "30%",
                        backgroundColor: isOpen ? "red" : "yellow",
                        width: isOpen ? "50%" : "100%",
                    }}
                    id="superkid"
                />
            )} */}
            <motion.div
                layout
                transition={transition}
                style={childStyles}
                id="child"
            >
                <motion.div
                    layout
                    transition={transition}
                    style={{
                        ...childStyles,
                        height: "30%",
                        backgroundColor: isOpen ? "yellow" : "red",
                        width: isOpen ? "50%" : "100%",
                    }}
                    id="yr"
                ></motion.div>
            </motion.div>
        </motion.div>
    )
}

const parent = {
    position: "absolute",
    backgroundColor: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
}

const openParent = {
    ...parent,
    width: 400,
    height: 400,
    left: 400,
    top: 0,
    alignItems: "flex-end",
    justifyContent: "flex-end",
}

const closedParent = {
    ...parent,
    width: 200,
    height: 200,
    left: 0,
    top: 0,
    alignItems: "flex-start",
    justifyContent: "flex-start",
}

const child = {
    width: 150,
    height: 150,
    backgroundColor: "blue",
    display: "flex",
}

const openChild = {
    ...child,
    alignItems: "center",
    justifyContent: "center",
}

const closedChild = {
    ...child,
    alignItems: "flex-start",
    justifyContent: "flex-start",
}
