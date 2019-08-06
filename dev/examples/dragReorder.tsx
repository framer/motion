import * as React from "react"
import { useState } from "react"
import { motion, useMotionValue } from "@framer"
import { clamp } from "@popmotion/popcorn"
import move from "array-move"

const Item = ({ color, active, setActive, setColors, colors, i }) => {
    const isDragging = color === active
    const dragOriginY = useMotionValue(0)

    return (
        <motion.li
            drag="y"
            dragOriginY={dragOriginY}
            onDragStart={() => setActive(color)}
            onDragEnd={() => setActive(null)}
            onDrag={(e, { point }) => {
                const targetIndex = findIndex(i, point.y)
                if (targetIndex === i) return
                setColors(move(colors, i, targetIndex))
            }}
            dragConstraints={isDragging && { top: 0, bottom: 0 }}
            dragElastic={1}
            style={{ background: color }}
            animate={isDragging ? { zIndex: 1 } : { zIndex: 0 }}
            positionTransition={({ delta }) => {
                if (isDragging) {
                    dragOriginY.set(dragOriginY.get() + delta.y)
                    return false
                } else {
                    return true
                }
            }}
            initial={false}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 1.1 }}
        />
    )
}

export const App = () => {
    const [active, setActive] = useState<string | null>(null)
    const [colors, setColors] = useState(initialColors)

    return (
        <>
            <ul>
                {colors.map((color, i) => (
                    <Item
                        key={color}
                        i={i}
                        active={active}
                        color={color}
                        colors={colors}
                        setColors={setColors}
                        setActive={setActive}
                    />
                ))}
            </ul>
            <style>{styles}</style>
        </>
    )
}

const height = 80
const marginBottom = 10
const totalHeight = height + marginBottom
const findIndex = (i, y) => {
    const baseY = totalHeight * i
    const totalY = baseY + y
    return clamp(0, initialColors.length - 1, Math.round(totalY / totalHeight))
}

const initialColors = ["#FF008C", "#D309E1", "#9C1AFF", "#7700FF"]

const styles = `body {
  width: 100vw;
  height: 100vh;
  background: white;
  overflow: hidden;
  padding: 0;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
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
