import * as React from "react"
import { motion, useCycle } from "@framer"

/** @public */
export type OverrideObject<T extends object = any> = Partial<T>
/** @public */
export type OverrideFunction<P extends object = any> = (props: P) => Partial<P>
/** @public */
export type Override<T extends object = any & { [key: string]: any }> =
    | OverrideObject<T>
    | OverrideFunction<T>

/**
 * @internal
 */
export function WithOverride<T extends object>(
    Component: React.ComponentType<T>,
    override: Override<T>
) {
    const useOverride =
        typeof override === "function"
            ? (props: T) => override(props)
            : () => override

    const ComponentWithOverride = function(props: T) {
        const overrideProps = useOverride(props)
        const { style, ...rest } = props as any
        return <Component {...props} {...overrideProps} />
    }
    return ComponentWithOverride
}

export function Hover(): Override {
    const [animate, cycle] = useCycle("normal", "hovered")
    return {
        onTap() {
            cycle()
        },
        variants: {
            hovered: {
                scale: 0.9,
                transition: { when: "afterChildren" },
            },
            normal: {
                scale: 1,
            },
        },
        animate,
    }
}

export function Rotate(): Override {
    return {
        variants: {
            hovered: {
                rotate: 45,
            },
            normal: {
                rotate: 0,
            },
        },
    }
}

const Frame1 = WithOverride(motion.div, Hover)
const Frame2 = WithOverride(motion.div, Rotate)

export const App = () => {
    return (
        <Frame1 style={style}>
            <Frame2 style={style2} />
        </Frame1>
    )
}

const style = {
    width: 200,
    height: 200,
    background: "white",
}

const style2 = {
    width: 100,
    height: 100,
    background: "red",
}
