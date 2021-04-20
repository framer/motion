import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { motion } from "@framer"
import { clamp, distance } from "popmotion"
import move from "array-move"

/**
 * This demonstrates drag working with automatic animations.
 * When the element moves in the underlying layout, it visually
 * stays stuck to the user's pointer.
 */

const Item = ({ color, setPosition, moveItem, i }) => {
    const [isDragging, setDragging] = useState(false)

    // We'll use a `ref` to access the DOM element that the `motion.li` produces.
    // This will allow us to measure its height and position, which will be useful to
    // decide when a dragging element should switch places with its siblings.
    const ref = useRef(null)

    // Update the measured position of the item so we can calculate when we should rearrange.
    useEffect(() => {
        setPosition(i, {
            height: ref.current.offsetHeight,
            top: ref.current.offsetTop,
        })
    })

    return (
        <li
            style={{
                padding: 0,
                height: heights[color],
                zIndex: isDragging ? 3 : 1,
            }}
        >
            <motion.div
                ref={ref}
                initial={false}
                id={`h${heights[color]}`}
                layout
                // If we're dragging, we want to set the zIndex of that item to be on top of the other items.
                style={{
                    background: color,
                    height: heights[color],
                    borderRadius: 5,
                }}
                whileHover={{
                    boxShadow: "0px 3px 3px rgba(0,0,0,0.15)",
                }}
                whileTap={{
                    boxShadow: "0px 5px 5px rgba(0,0,0,0.1)",
                }}
                drag="y"
                onDragStart={() => setDragging(true)}
                onDragEnd={() => setDragging(false)}
                onViewportBoxUpdate={(_viewportBox, delta) => {
                    // color === "#FF008C" && console.log(_viewportBox.y.min)
                    isDragging && moveItem(i, delta.y.translate)
                }}
            />
        </li>
    )
}

export const App = () => {
    const [colors, setColors] = useState(initialColors)

    // We need to collect an array of height and position data for all of this component's
    // `Item` children, so we can later us that in calculations to decide when a dragging
    // `Item` should swap places with its siblings.
    const positions = useRef<Position[]>([]).current
    const setPosition = (i: number, offset: Position) => (positions[i] = offset)

    // Find the ideal index for a dragging item based on its position in the array, and its
    // current drag offset. If it's different to its current index, we swap this item with that
    // sibling.
    const moveItem = (i: number, dragOffset: number) => {
        const targetIndex = findIndex(i, dragOffset, positions)
        if (targetIndex !== i) setColors(move(colors, i, targetIndex))
    }

    return (
        <ul>
            {colors.map((color, i) => (
                <Item
                    key={color}
                    i={i}
                    color={color}
                    setPosition={setPosition}
                    moveItem={moveItem}
                />
            ))}
            <style>{styles}</style>
        </ul>
    )
}

// Spring configs
const onTop = { zIndex: 1 }
const flat = {
    zIndex: 0,
    //transition: { delay: 0.3 },
}

const initialColors = ["#FF008C", "#D309E1", "#9C1AFF"] //, "#7700FF"]
const heights = {
    "#FF008C": 60,
    "#D309E1": 80,
    "#9C1AFF": 40,
    "#7700FF": 100,
}

export interface Position {
    top: number
    height: number
}

// Prevent rapid reverse swapping
const buffer = 5

export const findIndex = (
    i: number,
    yOffset: number,
    positions: Position[]
) => {
    let target = i
    const { top, height } = positions[i]
    const bottom = top + height

    // If moving down
    if (yOffset > 0) {
        const nextItem = positions[i + 1]
        if (nextItem === undefined) return i

        const swapOffset =
            distance(bottom, nextItem.top + nextItem.height / 2) + buffer
        if (yOffset > swapOffset) target = i + 1

        // If moving up
    } else if (yOffset < 0) {
        const prevItem = positions[i - 1]
        if (prevItem === undefined) return i

        const prevBottom = prevItem.top + prevItem.height
        const swapOffset =
            distance(top, prevBottom - prevItem.height / 2) + buffer
        if (yOffset < -swapOffset) target = i - 1
    }

    return clamp(0, positions.length, target)
}

const styles = `body {
  width: 100vw;
  height: 100vh;
  background: white;
  overflow: hidden;
  padding: 0;
  margin: 0;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
}

nav {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 300px;
}

ul,
li {
  list-style: none;
  padding: 0;
  margin: 0;
}

ul {
  position: relative;
  width: 300px;
}

li {
  border-radius: 10px;
  margin-bottom: 10px;
  cursor: pointer;
  width: 100%;
  height: 80px;
  position: relative;
}

.background {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 300px;
  background: #fff;
}

.refresh {
  padding: 10px;
  position: absolute;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 10px;
  width: 20px;
  height: 20px;
  top: 10px;
  right: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
`
