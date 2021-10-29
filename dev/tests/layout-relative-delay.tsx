import { m, LazyMotion, domMax } from "@framer"
import * as React from "react"

export const App = () => {
    const [state, setState] = React.useState(true)
    let frameCount = 0
    return (
        <LazyMotion features={domMax}>
            <m.div
                id="parent"
                onClick={() => setState(!state)}
                layout
                style={{
                    position: "absolute",
                    top: state ? 0 : 200,
                    left: state ? 0 : 200,
                    width: state ? 200 : 400,
                    height: 200,
                    background: "red",
                }}
                transition={{
                    ease: (t: number) => {
                        frameCount++
                        // This is a bit funny but boxes are resolved relatively after
                        // the first frame
                        return frameCount > 1 ? 0.5 : t
                    },
                }}
            >
                <m.div
                    id="child"
                    layout
                    style={{
                        width: state ? 100 : 200,
                        height: 100,
                        background: "blue",
                    }}
                    transition={{
                        delay: 100,
                    }}
                />
            </m.div>
        </LazyMotion>
    )
}
