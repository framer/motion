import * as React from "react"
import { motion } from "../../src"

const styleA = {
    width: 300,
    height: 300,
    background: "white",
    borderRadius: "10px",
}
function uuid() {
    return Math.random()
        .toString(33)
        .substr(3)
}
console.clear()
export const App = () => {
    const renderId = uuid()

    const [state, setState] = React.useState(0)

    console.log(
        `%cRender ${renderId}, state: %c${state}`,
        "background: orange; color: white; border-top-left-radius: 4px; border-bottom-left-radius: 4px; padding: 2px 5px;border: 1px solid orange; ",
        "background: white; color: orange; border-top-right-radius: 4px; border-bottom-right-radius: 4px; padding: 2px 5px; border: 1px solid orange; box-sizing: border-box;"
    )

    const onDrag = () => {
        console.log(
            `%cHandler ${renderId}: %c${state}→${state + 10}`,
            "background: yellowgreen; color: white; border-top-left-radius: 4px; border-bottom-left-radius: 4px; padding: 2px 5px;border: 1px solid yellowgreen; ",
            "background: white; color: yellowgreen; border-top-right-radius: 4px; border-bottom-right-radius: 4px; padding: 2px 5px; border: 1px solid yellowgreen; box-sizing: border-box;"
        )
        setState(state + 10)
    }

    onDrag.renderId = renderId
    return (
        <motion.div
            drag="x"
            dragConstraints={{ left: -500, right: 500 }}
            dragElastic
            dragMomentum
            dragTransition={{ bounceStiffness: 200, bounceDamping: 40 }}
            onDrag={onDrag}
            style={styleA}
        />
    )
}
