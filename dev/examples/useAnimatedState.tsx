import * as React from "react"
import { useAnimatedState } from "@framer"

export const App = () => {
    const [state, animate] = useAnimatedState({
        foo: 0,
    })
    console.log(state.foo)
    React.useEffect(() => {
        animate({ foo: 100 }, { duration: 3 })
    }, [])

    return <div style={{ color: "white" }}>{state.foo}</div>
}
