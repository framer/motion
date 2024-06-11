import { motion, useInstantTransition } from "framer-motion"
import { useState, useEffect } from "react"

const Component = ({ state, setState }: any) => {}

export const App = () => {
    const [state, setState] = useState(false)

    return (
        <motion.div
            initial={false}
            style={{
                width: 100,
                height: 100,
                background: "white",
            }}
        >
            <Component state={state} setState={setState} />
        </motion.div>
    )
}
