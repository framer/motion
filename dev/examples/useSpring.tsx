import * as React from "react"
import { useState, useMemo, useEffect, useRef } from "react"
import { render } from "react-dom"
import { motion, useMotionValue, useSpring } from "@framer"
import { distance } from "@popmotion/popcorn"
import { spring } from "popmotion"

// TODO: This example is waiting on the next Framer Beta publish

// Full docs: https://www.framer.com/api
// Download the beta: https://www.framer.com/beta

//const grid = [[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15]]
const grid = [[0]]
const size = 60
const gap = 10
const pushFactor = 0.4

const Square = ({ active, setActive, colIndex, rowIndex, itemIndex, x, y }) => {
    const isDragging = colIndex === active.col && rowIndex === active.row
    const diagonalIndex = (360 / 6) * (colIndex + rowIndex)
    const d = distance(
        { x: active.col, y: active.row },
        { x: colIndex, y: rowIndex }
    )
    const dx = useSpring(x, {
        stiffness: Math.max(700 - d * 120, 0),
        damping: 20 + d * 5,
    })
    const dy = useSpring(y, {
        stiffness: Math.max(700 - d * 120, 0),
        damping: 20 + d * 5,
    })

    return (
        <motion.div
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragTransition={{ bounceStiffness: 500, bounceDamping: 20 }}
            dragElastic={1}
            onDragStart={() => setActive({ row: rowIndex, col: colIndex })}
            transition={{ duration: 0.5, ease: "easeInOut", flip: Infinity }}
            style={{
                background: `hsla(calc(var(--base-hue) + ${diagonalIndex}), 80%, 60%, 1)`,
                width: size,
                height: size,
                top: rowIndex * (size + gap),
                left: colIndex * (size + gap),
                position: "absolute",
                borderRadius: "50%",
                x: isDragging ? x : dx,
                y: isDragging ? y : dy,
                zIndex: isDragging ? 1 : 0,
            }}
        />
    )
}

export function App() {
    const [active, setActive] = useState({ row: 0, col: 0 })
    const x = useSpring(0)
    const y = useSpring(0)
    const z = useMotionValue(0)

    return (
        <div className="app">
            <motion.div
                animate={{ "--base-hue": 360 } as any}
                initial={{ "--base-hue": 0 } as any}
                transition={{ duration: 10, loop: Infinity, ease: "linear" }}
                style={{ width: "100%", height: "100%" }}
            >
                <motion.div
                    style={{
                        display: "flex",
                        width: (size + gap) * 4 - gap,
                        height: (size + gap) * 4 - gap,
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        position: "relative",
                        perspective: 500,
                    }}
                >
                    {grid.map((row, rowIndex) =>
                        row.map((item, colIndex) => (
                            <Square
                                x={x}
                                y={y}
                                z={z}
                                itemIndex={item}
                                active={active}
                                setActive={setActive}
                                rowIndex={rowIndex}
                                colIndex={colIndex}
                                key={rowIndex + colIndex}
                            />
                        ))
                    )}
                </motion.div>
            </motion.div>
        </div>
    )
}
