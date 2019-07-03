import * as React from "react"
import { useState } from "react"
import { motion } from "@framer"

export const App = () => {
    const [count, setCount] = useState(4)

    const items = []

    for (let i = 0; i < count; i++) {
        items.push(
            <motion.li
                positionTransition
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ background: "red" }}
                key={i}
            />
        )
    }

    return (
        <div>
            <motion.ul positionTransition>{items}</motion.ul>
            <button onClick={() => setCount(count + 1)}>Add</button>
            <style>{styles}</style>
        </div>
    )
}

const styles = `
div {
    width: 400px;
    position: fixed;
    bottom: 10px;
    right: 10px;
    top: 10px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
}

ul,
li {
  list-style: none;
  padding: 0;
  margin: 0;
}

ul {
  display: flex;
  align-items: flex-end;
  flex-direction: column;
  justify-content: flex-end;
  position: relative;
}

li {
  border-radius: 10px;
  margin-bottom: 10px;
  margin-right: 10px;
  width: 300px;
  height: 50px;
}

button {
    position: fixed;
    bottom: 10px;
    right: 10px;
}`
