import { motion, useCycle } from "@framer"
import * as React from "react"

export const App = () => {
    const params = new URLSearchParams(window.location.search)
    const sibling = params.get("sibling") || false
    const [state, cycle] = useCycle(0, 1, 2)

    return (
        <>
            <button id="next" onClick={() => cycle()}>
                Next
            </button>
            {state !== 1 ? (
                <motion.div
                    id="box"
                    layout
                    layoutId="box"
                    style={{ ...(state === 0 ? a : b) }}
                    transition={{
                        duration: 0.15,
                        // ease: state === 2 ? () => 0.5 : undefined,
                    }}
                />
            ) : null}
            {/**
             * Test this twice, once with a sibling and once without. With a sibling,
             * didUpdate should fire as normal. Without a sibling, didUpdate won't fire as
             * the removed element is the only projecting element in the tree (so no lifecycle
             * methods can fire it) so the checkUpdateFailed will flag on the next frame
             * and cancel the update
             */}
            {sibling && state !== 2 ? (
                <motion.div
                    layout
                    style={{ ...box, backgroundColor: "blue", top: 200 }}
                />
            ) : null}
        </>
    )
}

const box = {
    position: "absolute",
    top: 100,
    left: 0,
    width: 100,
    height: 100,
    background: "red",
}

const a = {
    ...box,
}

const b = {
    ...box,
    left: 200,
}
