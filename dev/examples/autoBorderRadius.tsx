import * as React from "react"
import { useState } from "react"
import { motion, SyncLayout } from "@framer"

export const App = () => {
    const [isOn, setIsOn] = useState(false)

    return (
        <motion.div
            auto
            transition={{ duration: 2 }}
            style={isOn ? bigParent : smallParent}
            onClick={() => setIsOn(!isOn)}
        >
            <motion.div
                auto
                transition={{ duration: 2 }}
                style={isOn ? bigChild : smallChild}
            />
        </motion.div>
    )
}

const parent = {
    backgroundColor: "white",
}
const bigParent = { ...parent, width: 500, height: 500, borderRadius: 0 }
const smallParent = { ...parent, width: 100, height: 100, borderRadius: 50 }

const child = {
    backgroundColor: "red",
}
const bigChild = { ...child, width: 100, height: 100, borderRadius: 20 }
const smallChild = { ...child, width: 20, height: 20, borderRadius: 0 }
