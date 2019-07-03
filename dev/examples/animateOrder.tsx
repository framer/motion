import * as React from "react"
import { useEffect, useState } from "react"
import { motion, useCycle } from "@framer"
import { shuffle } from "lodash"

export const App = () => {
    const [count, setCount] = useState(1)

    const items = []

    for (let i = 0; i < count; i++) {
        items.push(
            <motion.li
                positionTransition={{}}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ background: "red" }}
                key={i}
            />
        )
    }

    return (
        <>
            <motion.ul positionTransition={{}}>{items}</motion.ul>
            <button onClick={() => setCount(count + 1)}>Add</button>
            <style>{styles}</style>
        </>
    )
}

const styles = `
ul,
li {
  list-style: none;
  padding: 0;
  margin: 0;
}

ul {
  position: relative;
  display: flex;
  width: 300px;
  align-items: flex-end;
  flex-wrap: wrap;
}

li {
  border-radius: 10px;
  margin-bottom: 10px;
  margin-right: 10px;
  width: 300px;
  height: 18px;
}`
