import * as React from "react"
import { useEffect, useState } from "react"
import { motionone } from "framer-motion"

/**
 * An example of the tween transition type
 */

const style = {
    width: 100,
    height: 100,
    background: "white",
}

export const App = () => {
    return <motionone.div animate={{ scale: 2 }} style={style} />
}
