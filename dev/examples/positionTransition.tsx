import * as React from "react"
import { useState, useEffect } from "react"
import { motion } from "@framer"
import { clamp } from "@popmotion/popcorn"

export const App = () => {
    const [colors, setColors] = useState(initialColors)
    const [widths, setWidths] = useState(initialWidths)

    useEffect(() => {
        setTimeout(() => {
            setWidths({
                "#FF008C": 200,
                "#D309E1": 300,
                "#9C1AFF": 100,
                "#7700FF": 150,
            })
        }, 2000)
    }, [])

    return (
        <ul className="items">
            {colors.map((color, i) => (
                <motion.li
                    key={color}
                    style={{
                        background: color,
                        width: widths[color],
                        float: widths["#7700FF"] === 150 ? "right" : "left",
                    }}
                    layoutTransition={{ duration: 2 }}
                />
            ))}
            <style>{`
      
        ul,
        li {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        ul {
          position: absolute;
          width: 300px;
          top: 100px;
          flex-wrap: wrap;
        }
        
        li {
          display: block;
          
          border-radius: 10px;
          margin-bottom: 10px;
          margin-right: 10px;
          height: 140px;
          transform-origin: 50% 50%;
        }
        
                
                `}</style>
        </ul>
    )
}

const onTop = { zIndex: 1 }
const flat = {
    zIndex: 0,
    transition: { delay: 0.3 },
}

const height = 80
const marginBottom = 10
const totalHeight = height + marginBottom
const findIndex = (i, y) => {
    // Could use a ref with offsetTop
    const baseY = totalHeight * i
    const totalY = baseY + y
    return clamp(0, initialColors.length - 1, Math.round(totalY / totalHeight))
}

const initialColors = ["#FF008C", "#D309E1", "#9C1AFF", "#7700FF"]
const initialWidths = {
    "#FF008C": 200,
    "#D309E1": 200,
    "#9C1AFF": 200,
    "#7700FF": 200,
}
