import { useEffect } from "react";
import { animate } from "framer-motion"

export const App = () => {
    useEffect(() => {
        let count = 0
        for (let i = 0; i < 2000; i++) {
            count++
            animate("rgba(0,0,0,0)", "rgba(255,255,255,1)", { duration: 20 })
        }

        console.log("started ", count, "animations")
    })

    return null
}
