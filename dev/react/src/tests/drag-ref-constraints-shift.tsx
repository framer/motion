import { motion } from "framer-motion"
import { memo, useEffect, useRef, useState } from "react"

/**
 * A draggable with ref constraints, moved down the page together with its
 * constraints without either re-rendering, so their layout isn't measured
 * again. Its drag constraints must still hold.
 *
 * ?test=drag-ref-constraints-shift         — content above grows (window.grow())
 * ?test=drag-ref-constraints-shift&sticky  — in a sticky header, page scrolled
 */
const Spacer = () => {
    const [height, setHeight] = useState(0)
    useEffect(() => {
        ;(window as any).grow = () => setHeight(200)
    }, [])
    return <div id="spacer" style={{ height }} />
}

const Draggable = memo(() => {
    const ref = useRef<HTMLDivElement>(null)
    return (
        <div
            id="constraints"
            ref={ref}
            style={{ width: 300, height: 300, background: "#eee" }}
        >
            <motion.div
                id="box"
                drag
                dragElastic={0}
                dragMomentum={false}
                dragConstraints={ref}
                style={{ width: 50, height: 50, background: "red" }}
            />
        </div>
    )
})

export const App = () => {
    const sticky = new URLSearchParams(window.location.search).has("sticky")

    return sticky ? (
        <div style={{ height: 3000 }}>
            <div style={{ height: 100 }} />
            <div style={{ position: "sticky", top: 0 }}>
                <Draggable />
            </div>
        </div>
    ) : (
        <>
            <Spacer />
            <Draggable />
        </>
    )
}
