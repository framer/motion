/**
 * #1411: a motion component's layoutId can change after it mounts. The
 * projection node must leave its old layoutId's stack and join the new one,
 * as if it had mounted with the new layoutId.
 *
 * Nodes are compared by identity, as Jest crashes trying to print one.
 */

import { createRef } from "react"
import { visualElementStore } from "motion-dom"
import { motion } from "../../render/components/motion"
import { render } from "../../jest.setup"
import { nextFrame } from "../../gestures/__tests__/utils"

const getNode = (element: HTMLElement) =>
    visualElementStore.get(element)!.projection!

describe("changing layoutId after mount (#1411)", () => {
    test("moves the node to the new layoutId's stack", async () => {
        const ref = createRef<HTMLDivElement>()
        const { rerender } = render(<motion.div ref={ref} layoutId="initial" />)
        const node = getNode(ref.current!)
        const { sharedNodes } = node.root!

        expect(sharedNodes.get("initial")!.lead === node).toBe(true)

        rerender(<motion.div ref={ref} layoutId="shared" />)
        await nextFrame()

        expect(node.getStack() === sharedNodes.get("shared")).toBe(true)
        expect(node.getStack()!.lead === node).toBe(true)
        expect((sharedNodes.get("initial")?.members ?? []).includes(node)).toBe(
            false
        )
    })

    test("can add and remove a layoutId", async () => {
        const ref = createRef<HTMLDivElement>()
        const { rerender } = render(<motion.div ref={ref} layout />)
        const node = getNode(ref.current!)
        const { sharedNodes } = node.root!

        rerender(<motion.div ref={ref} layout layoutId="added" />)
        await nextFrame()
        expect(sharedNodes.get("added")!.lead === node).toBe(true)

        rerender(<motion.div ref={ref} layout />)
        await nextFrame()
        expect((sharedNodes.get("added")?.members ?? []).includes(node)).toBe(
            false
        )
    })

    test("takes over from the lead of the new layoutId", async () => {
        const a = createRef<HTMLDivElement>()
        const b = createRef<HTMLDivElement>()
        const App = ({ id }: { id: string }) => (
            <>
                <motion.div ref={a} layoutId={id} />
                <motion.div ref={b} layoutId="shared" />
            </>
        )
        const { rerender } = render(<App id="initial" />)
        const nodeA = getNode(a.current!)
        const nodeB = getNode(b.current!)

        expect(nodeB.getStack()!.lead === nodeB).toBe(true)

        rerender(<App id="shared" />)

        const stack = nodeA.root!.sharedNodes.get("shared")!
        expect(stack.lead === nodeA).toBe(true)
        expect(stack.prevLead === nodeB).toBe(true)
        expect(nodeA.resumeFrom === nodeB).toBe(true)
    })
})
