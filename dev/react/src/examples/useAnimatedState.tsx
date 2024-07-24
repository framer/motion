import { useEffect } from "react";
import { useDeprecatedAnimatedState } from "framer-motion"

/**
 * An example of useAnimatedState. This isn't a supported API and this example is only for development purposes.
 */

export const App = () => {
    const [state, animate] = useDeprecatedAnimatedState({
        foo: 0,
    })
    console.log(state.foo)
    useEffect(() => {
        animate({ foo: 100 }, { duration: 3 })
    }, [])

    return <div style={{ color: "white" }}>{state.foo}</div>
}
