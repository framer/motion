import * as React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "@framer"

const add = (arr: number[], key: number) => {
    const newArray = [...arr]
    newArray.push(key)
    return newArray
}

const remove = (arr: number[], key: number): number[] => {
    const newArray = [...arr]
    newArray.splice(arr.indexOf(key), 1)
    return newArray
}
let next = 2
export const App = () => {
    const [items, setItems] = useState([1])

    return (
        <div>
            <motion.ul positionTransition style={{ color: items.length }}>
                <AnimatePresence initial={false}>
                    {items.map(key => (
                        <motion.li
                            positionTransition
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ background: "red" }}
                            key={key}
                            onClick={() => setItems(remove(items, key))}
                        />
                    ))}
                </AnimatePresence>
            </motion.ul>
            <button
                onClick={() => {
                    next++
                    setItems(add(items, next))
                }}
            >
                Add
            </button>
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
  flex-wrap: none;
  height: 100px;
}

li {
  border-radius: 10px;
  margin-bottom: 10px;
  margin-right: 10px;
  width: 300px;
  height: 50px;
  flex: 0 0 50px;
}

button {
    position: fixed;
    bottom: 10px;
    right: 10px;
}`
