import { motion, animate } from "framer-motion"
import * as React from "react"
import { useEffect, useState } from "react"
import styled from "styled-components"

const Container = styled.section`
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 100px;

    div {
        width: 100px;
        height: 100px;
        background-color: red;
    }
`

export const App = () => {
    const [count, setCount] = useState(0)
    const [result, setResult] = useState("")

    useEffect(() => {
        if (count % 2 === 0) return

        const output: number[] = []
        const controls = animate(0, 100, {
            duration: 0.5,
            ease: "linear",
            onUpdate: (v: number) => output.push(v),
            onComplete: () =>
                setResult(
                    output[1] !== 100 && output.length !== 2
                        ? "Success"
                        : "Fail"
                ),
        })
        return controls.stop
    }, [count])

    return (
        <Container>
            <button id="action" onClick={() => setCount((c) => c + 1)}>
                Animate
            </button>
            <input id="result" readOnly value={result} />
            <motion.div className="box" layout />
        </Container>
    )
}
