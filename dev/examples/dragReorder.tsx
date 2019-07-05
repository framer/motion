import * as React from "react"
import { useState } from "react"
import { motion } from "@framer"
import { clamp } from "@popmotion/popcorn"
import move from "array-move"

// TODO: Update to use positionTransition
export const App = () => {
    const [dragging, setDragging] = useState<string | null>(null)
    const [colors, setColors] = useState(initialColors)

    return (
        <ul style={{ height: colors.length * (height + gap) }}>
            <style>{styles}</style>
            {colors.map((color, i) => (
                <motion.li
                    key={color}
                    drag="y"
                    onDragStart={() => setDragging(color)}
                    onDragEnd={() => setDragging(null)}
                    onDrag={(e, { point }) => {
                        const targetIndex = yToIndex(point.y)

                        if (targetIndex !== i) {
                            setColors(move(colors, i, targetIndex))
                        }
                    }}
                    dragConstraints={
                        dragging === color && {
                            top: calcTop(i),
                            bottom: calcTop(i),
                        }
                    }
                    dragTransition={{ transitionEnd: { zIndex: 0 } }}
                    dragElastic={1}
                    style={{ background: color }}
                    animate={
                        dragging !== color
                            ? { y: calcTop(i) }
                            : { zIndex: 1, y: null }
                    }
                    initial={false}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 1.1 }}
                />
            ))}
        </ul>
    )
}

const height = 80
const gap = 10
const totalHeight = height + gap
const calcTop = i => i * totalHeight
const yToIndex = y =>
    clamp(0, initialColors.length - 1, Math.round(y / totalHeight))
const initialColors = ["#FF008C", "#D309E1", "#9C1AFF", "#7700FF", "#4400FF"]

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
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 80px;
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
