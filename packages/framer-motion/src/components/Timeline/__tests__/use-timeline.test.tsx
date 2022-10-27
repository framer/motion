import { render } from "../../../../jest.setup"
import * as React from "react"
import { Timeline } from "../index"
import { useTimeline } from "../use-timeline"

describe("useTimeline", () => {
    test("Returns motion values with initial values", async () => {
        await new Promise<void>((resolve) => {
            const Component = () => {
                const { x, color } = useTimeline("foo", {
                    x: 100,
                    color: "#f00",
                })

                expect(x.get()).toBe(100)
                expect(color.get()).toBe("#f00")

                return null
            }

            const TimelineComponent = () => (
                <Timeline
                    initial={false}
                    animate={[["foo", { x: 200, color: "#fff" }]]}
                >
                    <Component />
                </Timeline>
            )
            const { rerender } = render(<TimelineComponent />)
            rerender(<TimelineComponent />)

            resolve()
        })
    })
})
