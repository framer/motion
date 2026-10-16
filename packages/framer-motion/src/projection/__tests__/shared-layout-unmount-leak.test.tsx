/**
 * Regression coverage for issue #3940.
 *
 * Unmounting the last element with a given `layoutId` used to leave its
 * `NodeStack` in the projection root's `sharedNodes`, with `lead` still
 * pointing at the unmounted node (and through `options.visualElement.props`,
 * every closure passed to the component). With a unique `layoutId` per
 * instance this grew without bound.
 */

import { createRef, RefObject, useId } from "react"
import { visualElementStore } from "motion-dom"
import type { IProjectionNode, NodeStack } from "motion-dom"
import { motion } from "../../render/components/motion"
import { render } from "../../jest.setup"
import { nextFrame } from "../../gestures/__tests__/utils"

function getRoot(element: HTMLElement) {
    return visualElementStore.get(element)!.projection!.root!
}

/**
 * Let the post-unmount checks and the root update they trigger run.
 */
async function settle() {
    await nextFrame()
    await nextFrame()
}

describe("shared layout stacks are released on unmount (#3940)", () => {
    test("unique layoutIds don't accumulate in the root's sharedNodes", async () => {
        const anchor = createRef<HTMLDivElement>()

        const Item = () => {
            const id = useId()
            return <motion.div layoutId={id} onClick={() => {}} />
        }

        const App = ({ count }: { count: number }) => (
            <>
                <motion.div ref={anchor} layout />
                {Array.from({ length: count }, (_, i) => (
                    <Item key={i} />
                ))}
            </>
        )

        const { rerender } = render(<App count={0} />)
        const root = getRoot(anchor.current!)
        const initialSize = root.sharedNodes.size

        for (let cycle = 0; cycle < 3; cycle++) {
            rerender(<App count={5} />)
            await settle()
            expect(root.sharedNodes.size).toBe(initialSize + 5)

            rerender(<App count={0} />)
            await settle()
        }

        expect(root.sharedNodes.size).toBe(initialSize)
    })

    test("unmounted nodes aren't retained as a stack's lead", async () => {
        const ref = createRef<HTMLDivElement>()

        const { rerender } = render(<motion.div ref={ref} layoutId="box" />)
        const node = visualElementStore.get(ref.current!)!.projection!
        const root = node.root!

        rerender(<div />)
        await settle()

        expect(node.instance).toBeUndefined()
        const isRetained = [...root.sharedNodes.values()].some(
            (stack: NodeStack) => stack.lead === node || stack.prevLead === node
        )
        expect(isRetained).toBe(false)
    })

    test("a same-commit layoutId swap still hands off to the new element", async () => {
        const refA = createRef<HTMLDivElement>()
        const refB = createRef<HTMLDivElement>()

        const Tab = ({
            selected,
            highlight,
        }: {
            selected: boolean
            highlight: RefObject<HTMLDivElement>
        }) => (
            <div>
                {selected && <motion.div ref={highlight} layoutId="highlight" />}
            </div>
        )

        const App = ({ selected }: { selected: number }) => (
            <>
                <Tab selected={selected === 0} highlight={refA} />
                <Tab selected={selected === 1} highlight={refB} />
            </>
        )

        const { rerender } = render(<App selected={0} />)
        await settle()

        const prevNode = visualElementStore.get(refA.current!)!.projection!
        const root = prevNode.root!

        rerender(<App selected={1} />)

        /**
         * The old highlight unmounted and the new one mounted in the same
         * commit, so the new one must resume from the old one.
         */
        const nextNode = visualElementStore.get(refB.current!)!.projection!
        const stack = root.sharedNodes.get("highlight")!
        expect(stack.lead).toBe(nextNode)
        expect(stack.prevLead).toBe(prevNode)
        expect(nextNode.resumeFrom).toBe(prevNode)

        await settle()

        expect(root.sharedNodes.get("highlight")).toBe(stack)
        expect(stack.members).toEqual([nextNode])

        rerender(<App selected={-1} />)
        await settle()

        expect(root.sharedNodes.has("highlight")).toBe(false)
    })

    test("a layoutId mounted after its stack was released starts a fresh stack", async () => {
        const ref = createRef<HTMLDivElement>()

        const App = ({ show }: { show: boolean }) =>
            show ? <motion.div ref={ref} layoutId="box" /> : null

        const anchor = createRef<HTMLDivElement>()
        const { rerender } = render(
            <>
                <motion.div ref={anchor} layout />
                <App show />
            </>
        )
        const root = getRoot(anchor.current!)
        await settle()

        rerender(
            <>
                <motion.div ref={anchor} layout />
                <App show={false} />
            </>
        )
        await settle()
        expect(root.sharedNodes.has("box")).toBe(false)

        rerender(
            <>
                <motion.div ref={anchor} layout />
                <App show />
            </>
        )
        const node = visualElementStore.get(ref.current!)!
            .projection as IProjectionNode
        const stack = root.sharedNodes.get("box")!
        expect(stack.members).toEqual([node])
        expect(stack.lead).toBe(node)
        expect(stack.prevLead).toBeUndefined()
    })
})
