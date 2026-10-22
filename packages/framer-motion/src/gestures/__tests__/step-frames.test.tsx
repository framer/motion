import { MotionGlobalConfig } from "motion-utils"
import { AnimatePresence, motion } from "../../"
import { render } from "../../jest.setup"
import { stepFrames } from "./utils"

afterEach(() => {
    MotionGlobalConfig.useManualTiming = false
})

describe("stepFrames", () => {
    test("lets React commit between frames", async () => {
        const transition = { duration: 0.2, ease: "linear" } as const
        const Component = ({ id }: { id: string }) => (
            <AnimatePresence mode="wait">
                <motion.div
                    key={id}
                    data-testid={id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={transition}
                />
            </AnimatePresence>
        )

        const { rerender, queryByTestId } = render(<Component id="a" />)
        await stepFrames(300)
        rerender(<Component id="b" />)

        // a exits for 200ms, then b enters and is halfway at 300ms
        await stepFrames(300)
        expect(queryByTestId("a")).toBeNull()
        expect(parseFloat(queryByTestId("b")!.style.opacity)).toBeCloseTo(
            0.5,
            1
        )
    })
})
