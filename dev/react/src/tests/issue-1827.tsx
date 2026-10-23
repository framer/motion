import { motion, useMotionValue } from "framer-motion"
import { useRef, useState } from "react"

/**
 * Issue #1827: dragConstraints by ref doesn't consider changes after initial render.
 *
 * ?mode=box       — button grows the draggable box (100 -> 300 wide) via React state
 * ?mode=container — button shrinks the constraints container (500 -> 300 wide)
 * ?mode=scale     — button changes the draggable's `scale` style (1 -> 2)
 * ?mode=scale-center — as scale, with the default (centre) transform origin
 * ?mode=scale-initial — draggable has scale 2 from the first render
 * ?mode=scale-rerender — scale 2 from the first render, button re-renders it
 * ?mode=scale-value — button sets a `scale` motion value to 2, no re-render
 * ?mode=object — button swaps `dragConstraints` from false to an object
 * ?mode=none      — button does nothing (control)
 */
export const App = () => {
    const params = new URLSearchParams(window.location.search)
    const mode = params.get("mode") || "box"
    const ref = useRef<HTMLDivElement>(null)
    const [toggled, setToggled] = useState(false)
    const scaleValue = useMotionValue(1)

    const boxSize = mode === "box" && toggled ? 300 : 100
    const containerWidth = mode === "container" && toggled ? 300 : 500
    const scale =
        mode === "scale-value"
            ? scaleValue
            : ((mode === "scale" || mode === "scale-center") && toggled) ||
              mode === "scale-initial" ||
              mode === "scale-rerender"
            ? 2
            : 1

    return (
        <div style={{ margin: 0, padding: 0 }}>
            <button
                id="toggle"
                onClick={() =>
                    mode === "scale-value"
                        ? scaleValue.set(2)
                        : setToggled(!toggled)
                }
                style={{ position: "fixed", top: 520, left: 10 }}
            >
                toggle
            </button>
            <div
                id="constraints"
                ref={ref}
                style={{
                    width: containerWidth,
                    height: 400,
                    background: "rgba(0,0,255,0.1)",
                    position: "absolute",
                    top: 0,
                    left: 0,
                }}
            >
                <motion.div
                    id="box"
                    drag
                    dragConstraints={
                        mode === "object"
                            ? toggled && {
                                  left: 0,
                                  right: 400,
                                  top: 0,
                                  bottom: 0,
                              }
                            : ref
                    }
                    dragElastic={0}
                    dragMomentum={false}
                    style={{
                        width: boxSize,
                        height: 100,
                        background: "red",
                        scale,
                        ...(mode === "scale-center"
                            ? { marginLeft: 100, marginTop: 100 }
                            : { originX: 0, originY: 0 }),
                    }}
                />
            </div>
        </div>
    )
}
