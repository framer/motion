import * as React from "react"
import { useState } from "react"
import { motion, AnimatePresence, LayoutGroup } from "framer-motion"

/**
 * This is a stress test of snapshotting ability as components
 * animate between the two lists.
 */

interface ListProps {
    list: number[]
    onItemClick: (id: number) => void
    backgroundColor: string
}

const transition = {
    type: "spring",
    duration: 2,
}

const List = ({ list, onItemClick, backgroundColor }: ListProps) => {
    return (
        <motion.ul layout style={styles.list} drag transition={transition}>
            <AnimatePresence>
                {list.map((id) => (
                    <motion.li
                        style={{ ...styles.item, backgroundColor, z: 2 }}
                        key={id}
                        layoutId={id}
                        id={"list-" + id}
                        onClick={() => onItemClick(id)}
                        transition={transition}
                        //  drag
                    />
                ))}
            </AnimatePresence>
        </motion.ul>
    )
}

export const App = () => {
    // const [listA, setListA] = useState([0, 1, 2, 3, 4, 5, 6])
    // const [listB, setListB] = useState([7, 8, 9, 10, 11, 12])

    //const [lists, setLists] = useState([[0], [1]])
    const [lists, setLists] = useState([
        [3, 1, 2],
        [7, 8, 9],
    ])

    return (
        <LayoutGroup>
            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    backgroundColor: "#222222",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <div style={styles.container}>
                    <List
                        list={lists[0]}
                        onItemClick={(id) => moveItem(id, 1, lists, setLists)}
                        backgroundColor="#ff3366"
                    />
                    <List
                        list={lists[1]}
                        onItemClick={(id) => moveItem(id, 0, lists, setLists)}
                        backgroundColor="#0099ff"
                    />
                </div>
            </div>
        </LayoutGroup>
    )
}

const styles = {
    container: {
        width: "70%",
        margin: "0 auto",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "flex-end",
    },
    list: {
        width: 350,
        borderRadius: 10,
        padding: 10,
        backgroundColor: "#444444",
        display: "flex",
        listStyle: "none",
        flexDirection: "column",
    },

    item: {
        height: 50,
        width: 330,
        borderRadius: 5,
        margin: 10,
        zIndex: 1,
        z: 1,
        position: "relative",
    },
}

function moveItem(
    id: number,
    targetListId: number,
    [a, b]: number[][],
    setLists: (lists: number[][]) => void
): void {
    const targetList = targetListId === 0 ? a : b
    const originList = targetListId === 0 ? b : a

    const newOriginList = [...originList]
    const originIndex = newOriginList.indexOf(id)
    newOriginList.splice(originIndex, 1)

    const newTargetList = [...targetList]
    newTargetList.splice(0, 0, id)

    setLists(
        targetListId === 0
            ? [newTargetList, newOriginList]
            : [newOriginList, newTargetList]
    )
}
