import * as React from "react"
import { useState } from "react"
import { motion, useMotionValue, useSpring, frame } from "framer-motion"
import { cancelFrame } from "framer-motion"

export function App() {
    const value = useMotionValue(0)

    React.useEffect(() => {
        value.set(0)

        const test = () => {
            frame.update(() => {
                value.set(1)
                console.log(
                    1,
                    "velocity, should be non-zero",
                    value.getVelocity()
                )

                frame.update(() => {
                    value.set(2)
                    console.log(
                        2,
                        "velocity, should be 60ish",
                        value.getVelocity()
                    )

                    frame.update(() => {
                        console.log(
                            "velocity, should probably be same as previous frame",
                            value.getVelocity()
                        )
                        value.set(3)
                        console.log(
                            "velocity, should be 60ish",
                            value.getVelocity()
                        )

                        setTimeout(() => {
                            frame.update(() => {
                                console.log(
                                    "before update, should be 0: ",
                                    value.getVelocity()
                                )
                                value.set(4)
                                console.log(
                                    4,
                                    "after update, should be non-zero: ",
                                    value.getVelocity()
                                )
                            })
                        }, 500)
                    })
                })
            })
        }

        const timeout = setTimeout(test, 2000)

        return () => {
            clearTimeout(timeout)
        }
    }, [value])

    return null
}
