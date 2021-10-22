import * as React from "react"
import { motion, AnimatePresence, useInstantLayoutTransition } from "@framer"

export const App = () => {
    const [isVisible, setIsVisible] = React.useState(true)
    const startTransition = useInstantLayoutTransition()

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    onClick={() => startTransition(() => setIsVisible(false))}
                    data-testid="cancellable"
                    style={{ height: 100 }}
                />
            )}
        </AnimatePresence>
    )
}
