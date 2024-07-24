import { useRef } from "react";
import gsap from "gsap"
import { useGSAP } from "@gsap/react"

/**
    Cold Start: GSAP

    This benchmarks cold start - when an animation library has to
    read values from the DOM.

    Run in private browsing mode to avoid browser plugins interfering with
    benchmark.
 */

const box = {
    width: 10,
    height: 100,
    backgroundColor: "#fff",
}

const boxContainer = {
    width: 100,
    height: 100,
}

const num = 100

function Box() {
    const ref = useRef(null)

    useGSAP(
        () => {
            gsap.to(ref.current, {
                rotate: Math.random() * 360,
                backgroundColor: "#f00",
                width: Math.random() * 100 + "%",
                x: 5,
                duration: 1,
            })
        },
        { scope: ref }
    )

    return (
        <div style={boxContainer}>
            <div ref={ref} style={box} />
        </div>
    )
}

export const App = () => {
    const children = []

    for (let i = 0; i < num; i++) {
        children.push(<Box />)
    }

    return (
        <div
            style={{
                padding: 100,
                width: "100%",
                display: "flex",
                flexWrap: "wrap",
            }}
        >
            {children}
        </div>
    )
}
