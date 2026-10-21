import { act, createRef } from "react"
import { AnimatePresence, motion } from "../../.."
import { render } from "@testing-library/react"
import { nextFrame } from "../../../gestures/__tests__/utils"

const getPopRule = () => {
    for (const style of Array.from(document.head.querySelectorAll("style"))) {
        for (const rule of Array.from(style.sheet?.cssRules ?? [])) {
            if (rule.cssText.includes("data-motion-pop-id")) {
                return (rule as CSSStyleRule).style
            }
        }
    }
}

/**
 * Regression test for #2348.
 *
 * PopChild pins the popped element to its offsetParent's edges. If popping
 * the element out of the layout moves the offsetParent (a bottom-anchored or
 * centred container shrinking around its remaining children), the element
 * moved with it. JSDOM has no layout, so the move is mocked: once popped, the
 * element is laid out `drop` pixels lower than before.
 */
describe("AnimatePresence popLayout when popping moves the container", () => {
    const { getBoundingClientRect } = HTMLElement.prototype

    afterEach(() => {
        HTMLElement.prototype.getBoundingClientRect = getBoundingClientRect
    })

    async function popWithDrop(drop: number, anchorY?: "top" | "bottom") {
        HTMLElement.prototype.getBoundingClientRect = function () {
            const top =
                this.dataset?.testid === "item"
                    ? 100 + (this.dataset.motionPopId ? drop : 0)
                    : 0
            return { left: 20, top } as DOMRect
        }

        const ref = createRef<HTMLDivElement>()

        const Component = ({ isVisible }: { isVisible: boolean }) => (
            <AnimatePresence mode="popLayout" anchorY={anchorY}>
                {isVisible && (
                    <motion.div
                        ref={ref}
                        data-testid="item"
                        style={{ width: "50px", height: "50px" }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    />
                )}
            </AnimatePresence>
        )

        const { rerender, unmount } = render(<Component isVisible />)
        await nextFrame()

        await act(async () => {
            rerender(<Component isVisible={false} />)
        })

        expect(ref.current!.dataset.motionPopId).toBeDefined()
        const rule = getPopRule()!
        unmount()
        return rule
    }

    test("offsets the popped element back to where it was", async () => {
        const rule = await popWithDrop(70)
        expect(rule.getPropertyValue("top")).toBe("-70px")
        expect(rule.getPropertyPriority("top")).toBe("important")
    })

    test("offsets a bottom-anchored popped element back to where it was", async () => {
        const rule = await popWithDrop(70, "bottom")
        // offsetParent height (0) - height (50) - offsetTop (0) + 70
        expect(rule.getPropertyValue("bottom")).toBe("20px")
    })

    test("leaves the popped element in place if the container didn't move", async () => {
        const rule = await popWithDrop(0)
        expect(rule.getPropertyValue("top")).toBe("0px")
    })
})
