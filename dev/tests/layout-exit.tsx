import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"

export const App = () => {
    const [visible, setVisible] = React.useState(true)

    const animation = {
        x: 0,
        opacity: 0.5,
    }

    React.useEffect(() => setVisible(!visible), [])

    return (
        <>
            <AnimatePresence>
                {visible && (
                    <motion.div
                        id="box"
                        layout
                        style={{ width: 100, height: 100, background: "blue" }}
                        exit={animation}
                    />
                )}
            </AnimatePresence>
        </>
    )
}
