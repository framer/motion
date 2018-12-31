import * as React from "react"
import { motion } from "@framer"

const Test = React.forwardRef((props: { foo: number; bar: string }, ref: React.Ref<HTMLDivElement>) => {
    return (
        <div ref={ref}>
            {props.foo},{props.bar}
        </div>
    )
})

const MotionBox = motion(Test)(() => {
    return {
        default: { rotate: 0, backgroundColor: "#f00" },
        foo: { rotate: 45, backgroundColor: "#0f0" },
    }
})

export const App = () => {
    return <MotionBox pose={"foo"} foo={9} bar={"test"} />
}
