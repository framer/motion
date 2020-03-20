import * as React from "react"
import { useState } from "react"
import { motion, MagicMotion } from "@framer"

export const App = () => {
    const [isOn, setIsOn] = useState(false)

    return (
        <MagicMotion>
            <div
                style={!isOn ? alignLeft : alignRight}
                onClick={() => setIsOn(!isOn)}
            >
                <motion.div
                    magic
                    transition={{ duration: 1 }}
                    style={isOn ? smallParent : bigParent}
                    id="parent"
                >
                    <motion.div
                        magic
                        id="child"
                        transition={{ duration: 1 }}
                        style={isOn ? bigChild : smallChild}
                    />
                </motion.div>
            </div>
        </MagicMotion>
    )
}

const container = {
    display: "flex",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
}
const alignLeft = {
    ...container,
    justifyContent: "center",
}

const alignRight = {
    ...container,
    justifyContent: "flex-end",
}

const parent = {
    backgroundColor: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
}

const smallParent = { ...parent, width: 200, height: 200 }

const bigParent = { ...parent, width: 300, height: 300 }

const child = {
    backgroundColor: "red",
    borderRadius: 20,
}

const smallChild = { ...child, width: 50, height: 50 }

const bigChild = { ...child, width: 150, height: 150 }
