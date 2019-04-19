import { AnimationControls } from "./AnimationControls"
import { useMemo, useEffect } from "react"

/**
 * The `useAnimation` hook returns `AnimationControls`, which can be used to manually start, stop and sequence animations on one or more Frames.
 *
 * The returned `AnimationControls` should be passed as the `animate` property of the `Frame`. It can be passed to any number of Frames. These Frames can be animated with the `start` method. It accepts the same properties as the `animate` property.
 *
 * ```jsx
 *
 * import * as React from "react"
 * import { Frame, useAnimation } from "framer"
 *
 * export function MyComponent(props) {
 *    const controls = useAnimation()
 *
 *    controls.start({
 *        x: 100,
 *        transition: { duration: 0.5 },
 *    })
 *
 *    return <Frame animate={controls} />
 * }
 *
 * ```
 *
 * @returns Animation controller with `start` and `stop` methods
 *
 * @public
 */
export function useAnimation() {
    const animationControls = useMemo(() => new AnimationControls(), [])

    useEffect(() => {
        animationControls.mount()
        return () => animationControls.unmount()
    }, [])

    return animationControls
}
