import { motion } from "@framer"
import * as React from "react"
import { useRef, useLayoutEffect, useEffect } from "react"

export const App = () => {
    const vanillaRef = useRef(null)
    const motionRef = useRef(null)

    useLayoutEffect(() => {
        console.log("useLayoutEffect =======")
        console.log("vanilla ref", vanillaRef.current)
        console.log("motion ref", motionRef.current)
    })

    useEffect(() => {
        console.log("useEffect =======")
        console.log("vanilla ref", vanillaRef.current)
        console.log("motion ref", motionRef.current)
    })

    return (
        <>
            <div ref={vanillaRef} />
            <motion.div ref={motionRef} />
        </>
    )
}
