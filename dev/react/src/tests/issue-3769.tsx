import {
    motion,
    MotionValue,
    useMotionValue,
    useTransform,
} from "framer-motion"
import { useEffect, useLayoutEffect } from "react"

/**
 * #3769: a useTransform value should follow a source MotionValue that's set
 * in an effect. The dev app renders in StrictMode.
 *
 * - "effect": set in the component's own useEffect. Strict Mode's cleanup
 *   cancels the scheduled update and the re-run sets the same value.
 * - "child-layout-effect": set in a child's layout effect, which runs
 *   before the parent subscribes to the source.
 */
function Setter({ x }: { x: MotionValue<number> }) {
    useLayoutEffect(() => x.set(10), [])
    return null
}

function Probe({ id }: { id: string }) {
    const x = useMotionValue(0)
    const doubled = useTransform(() => x.get() * 2)

    useEffect(() => {
        if (id === "effect") x.set(10)
        ;(window as any)[id] = { x, doubled }
    }, [])

    return (
        <>
            <motion.div id={id}>{doubled}</motion.div>
            {id === "child-layout-effect" && <Setter x={x} />}
        </>
    )
}

export const App = () => (
    <>
        <Probe id="effect" />
        <Probe id="child-layout-effect" />
    </>
)
