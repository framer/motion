import * as React from "react"
import { animate } from "framer-motion"

export const App = () => {
    React.useEffect(() => {
        let count = 0
        for (let i = 0; i < 2000; i++) {
            count++
            animate(0, 100, { duration: 20, ease: "linear" })
        }

        console.log("started ", count, "animations")
    })

    return null
}
