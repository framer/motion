import * as React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "@framer"

export const App = () => {
    const [notifications, setNotifications] = useState([0])

    return (
        <div className="container">
            <ul>
                <AnimatePresence>
                    {notifications.map(id => (
                        <motion.li
                            key={id}
                            positionTransition
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            initial={{ opacity: 0, y: 50, scale: 0.3 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{
                                opacity: 0,
                                scale: 0.5,
                                transition: { duration: 0.2 },
                            }}
                            onDrag={(e, { offset }) => {
                                offset.x > 50 &&
                                    setNotifications(remove(notifications, id))
                            }}
                        />
                    ))}
                </AnimatePresence>
            </ul>
            <button onClick={() => setNotifications(add(notifications))}>
                +
            </button>
            <style>{styles}</style>
        </div>
    )
}

const remove = (arr: number[], item: number) => {
    const newArr = [...arr]
    newArr.splice(newArr.findIndex(i => i === item), 1)
    return newArr
}

let newIndex = 0
const add = (arr: number[]) => {
    newIndex++
    return [...arr, newIndex]
}

const styles = `
body {
    width: 100vw;
    height: 100vh;
    background: linear-gradient(180deg, #ff008c 0%, rgb(211, 9, 225) 100%);
    overflow: hidden;
    padding: 0;
    margin: 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  * {
    box-sizing: border-box;
  }
  
  .container {
    display: flex;
    width: 100vw;
    height: 100vh;
    flex-direction: column;
  }
  
  ul,
  li {
    padding: 0;
    margin: 0;
  }
  
  ul {
    position: fixed;
    bottom: 0;
    right: 0;
    top: 0;
    display: flex;
    flex-direction: column;
    list-style: none;
    justify-content: flex-end;
  }
  
  li {
    width: 300px;
    background: white;
    margin: 10px;
    flex: 0 0 100px;
  }
  `
