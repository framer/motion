import { render } from "../../../jest.setup"
import { m, AnimationFeature, MotionConfig } from "../../"
import * as React from "react"
import { motionValue } from "../../value"

describe("Dynamic feature loading", () => {
    test("Doesn't animate to set prop without loaded features", async () => {
        const promise = new Promise(resolve => {
            const x = motionValue(0)
            const onComplete = () => resolve(x.get())
            const Component = () => (
                <m.div
                    animate={{ x: 20 }}
                    transition={{ duration: 0.01 }}
                    style={{ x }}
                    onAnimationComplete={onComplete}
                />
            )
            const { rerender } = render(<Component />)
            rerender(<Component />)

            setTimeout(() => resolve(x.get()), 50)
        })

        return expect(promise).resolves.not.toBe(20)
    })

    test("Does animate to set prop without loaded features", async () => {
        const promise = new Promise(resolve => {
            const x = motionValue(0)
            const onComplete = () => resolve(x.get())
            const Component = () => (
                <MotionConfig features={[AnimationFeature]}>
                    <m.div
                        animate={{ x: 20 }}
                        transition={{ duration: 0.01 }}
                        style={{ x }}
                        onAnimationComplete={onComplete}
                    />
                </MotionConfig>
            )
            const { rerender } = render(<Component />)
            rerender(<Component />)
        })

        return expect(promise).resolves.toBe(20)
    })
})
