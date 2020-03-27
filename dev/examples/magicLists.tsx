import * as React from "react"
import { useState } from "react"
import { motion, MagicMotion } from "@framer"

interface ListProps {
    list: number[]
    onItemClick: (id: number) => void
    backgroundColor: string
}

const List = ({ list, onItemClick, backgroundColor }: ListProps) => {
    return (
        <motion.ul magic style={styles.list}>
            {list.map(id => (
                <motion.li
                    style={{ ...styles.item, backgroundColor, z: 2 }}
                    key={id}
                    magicId={id}
                    id={"list-" + id}
                    onClick={() => onItemClick(id)}
                    drag
                />
            ))}
        </motion.ul>
    )
}

export const App = () => {
    // const [listA, setListA] = useState([0, 1, 2, 3, 4, 5, 6])
    // const [listB, setListB] = useState([7, 8, 9, 10, 11, 12])

    //const [lists, setLists] = useState([[0], [1]])
    const [lists, setLists] = useState([
        [0, 1, 2],
        [7, 8, 9],
    ])

    return (
        <MagicMotion transition={{ duration: 2 }}>
            <div style={styles.container}>
                <List
                    list={lists[0]}
                    onItemClick={id => moveItem(id, 1, lists, setLists)}
                    backgroundColor="red"
                />
                <List
                    list={lists[1]}
                    onItemClick={id => moveItem(id, 0, lists, setLists)}
                    backgroundColor="blue"
                />
            </div>
        </MagicMotion>
    )
}

const styles = {
    container: {
        width: "100%",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "flex-end",
    },
    list: {
        width: 350,
        borderRadius: 10,
        padding: 10,
        backgroundColor: "white",
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
