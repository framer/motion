import * as React from "react"
import { animated, motion } from "framer-motion"
import styled from "styled-components"

/**
 * An example of the tween transition type
 */

const style = {
    width: 100,
    height: 100,
    background: "var(--blue)",
    borderRadius: 10,
}

const Button = styled.button`
    -webkit-appearance: button;
    border: none;
    padding: 15px 25px;
    border-radius: 50px;
    font-size: 18px;
    font-weight: 700;
    cursor: pointer;
    width: 100px;
    background: var(--blue);
    color: var(--white);
    width: 250px;
`

function Component() {
    return (
        <motion.div
            animate={{
                transform: "rotate(360deg)",
                backgroundColor: ["red"],
            }}
        />
    )
}

export const App = () => {
    const buttonRef = React.useRef<HTMLButtonElement>(null)

    const blockJs = React.useCallback(() => {
        buttonRef.current!.style.background = "rgba(200,200,200,1)"

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const time = performance.now()

                while (performance.now() - time < 2000) {}
                buttonRef.current!.style.background = "var(--blue)"
            })
        })
    }, [])

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 40,
            }}
        >
            <animated.div
                animate={{
                    transform: ["none", "rotate(360deg)"],
                    backgroundColor: [
                        "var(--blue)",
                        "var(--red)",
                        "var(--green)",
                        "var(--blue)",
                    ],
                }}
                transition={{ duration: 5, repeat: Infinity, easing: "linear" }}
                style={{ ...style }}
            />
            <motion.div
                animate={{
                    rotate: 360,
                    backgroundColor: ["var(--pink)", "var(--blue)"],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                style={{ ...style }}
            />

            <Button ref={buttonRef} onClick={blockJs}>
                Block JavaScript
            </Button>
        </div>
    )
}
