import { Suspense, useEffect, useState } from "react"
import { motion } from "framer-motion"

const SuspenseTest = ({ shouldSuspend }: { shouldSuspend: boolean }) => {
    const [promise, setPromise] = useState<null | Promise<void>>(null)

    useEffect(() => {
        let timeoutId = setTimeout(() => {
            setPromise(
                new Promise((resolve) => {
                    timeoutId = setTimeout(() => {
                        resolve()
                        setPromise(null)
                        timeoutId = null
                    }, 1000)
                })
            )
        }, 1000)

        return () => {
            if (timeoutId != null) {
                clearTimeout(timeoutId)
            }
        }
    }, [])

    if (promise && shouldSuspend) {
        throw promise
    }

    return (
        <motion.div
            style={{ fontWeight: "bold", display: "inline-block" }}
            initial={{ opacity: 0.2, scale: 1 }}
            animate={{ opacity: 1, scale: 2 }}
            transition={{ duration: 2 }}
        >
            {shouldSuspend ? "With suspense" : "Without suspense"}
        </motion.div>
    )
}

export function App() {
    const [count, setCount] = useState(0)

    return (
        <>
            <button onClick={() => setCount((count) => count + 1)}>
                Re-mount components
            </button>
            <div key={count} style={{ width: 300, margin: "100px auto" }}>
                <div style={{ marginBottom: 24 }}>
                    <Suspense fallback={<div>Suspended</div>}>
                        <SuspenseTest shouldSuspend={true} />
                    </Suspense>
                </div>
                {/* <SuspenseTest shouldSuspend={false} /> */}
            </div>
            <p>
                The above animation is the same for both components. One
                suspends halfway through and the other does not. Click "Re-mount
                components" to run the animations again. Notice how the scale
                animation is stuck half way and the opacity animation is reset
                in the suspended component.
            </p>
        </>
    )
}
