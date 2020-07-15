import { render } from "../../../jest.setup"
import { motion } from "../.."
import * as React from "react"
import { RefObject } from "react"

interface Props {
    foo: boolean
}

describe("motion.custom", () => {
    test("accepts custom types", () => {
        const BaseComponent = React.forwardRef(
            (_props: Props, ref: RefObject<HTMLDivElement>) => {
                return <div ref={ref} />
            }
        )

        const MotionComponent = motion.custom<Props>(BaseComponent)

        const Component = () => <MotionComponent foo />

        render(<Component />)
    })
})
