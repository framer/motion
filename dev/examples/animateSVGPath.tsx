import * as React from "react"
import { useState } from "react"
import { motion } from "@framer"

const style = {
    width: 100,
    height: 100,
    background: "#f00",
}

const containerVariants = {
    loading: {
        opacity: 1,
        transition: { duration: 0.3 },
    },
    loaded: {},
}

const circleVariants = {
    loading: {
        pathLength: 30,
        rotate: 0,
        transition: {
            pathLength: {
                duration: 0.5,
            },
            rotate: {
                type: "physics",
                velocity: 500,
            },
        },
    },
    loaded: (props, current) => {
        return {
            pathLength: 100,
            rotate: current.rotate + 360,
            transition: {
                duration: 0.6,
            },
        }
    },
}

const tickVariants = {
    loading: {
        pathLength: 0,
    },
    loaded: {
        pathLength: 100,
        transition: { delay: 0.3 },
    },
}

export const App = () => {
    const [hasLoaded, setHasLoaded] = useState(false)

    return (
        <motion.div
            initial={{ opacity: 0, background: "rgba(255, 255, 255, 0)" }}
            onClick={() => setHasLoaded(true)}
            variants={containerVariants}
            animate={hasLoaded ? "loaded" : "loading"}
        >
            <svg
                width="250"
                height="250"
                viewBox="0 0 32 32"
                xmlns="http://www.w3.org/2000/svg"
            >
                <g
                    strokeWidth="2"
                    stroke="#FF1C68"
                    fill="none"
                    transform="translate(1, 1.2)"
                >
                    <motion.path
                        d="M14 28c7.732 0 14-6.268 14-14S21.732 0 14 0 0 6.268 0 14s6.268 14 14 14z"
                        opacity="1"
                        variants={circleVariants}
                    />
                    <motion.path
                        d="M6.173 16.252l5.722 4.228 9.22-12.69"
                        opacity="1"
                        variants={tickVariants}
                    />
                </g>
            </svg>
        </motion.div>
    )
}
