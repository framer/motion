/**
 * #1411: a motion component's layoutId can change after it mounts. The
 * projection node must leave its old layoutId's stack and join the new one,
 * as if it had mounted with the new layoutId.
 *
 * Nodes are compared by identity, as Jest crashes trying to print one.
 */

import { createRef, StrictMode } from "react"
import { visualElementStore } from "motion-dom"
import { LayoutGroup } from "../../components/LayoutGroup"
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

    /**
     * The lead being taken over must be measured for the takeover, as it is
     * when a node mounts with its layoutId (createProjectionNode calls
     * lead.willUpdate()). A sibling that doesn't willUpdate() itself (constant
     * layoutDependency, or memoised so it doesn't re-render) would otherwise
     * never get a layout, so it couldn't follow the new lead or crossfade.
     */
    test("measures the lead it takes over from", async () => {
        const a = createRef<HTMLDivElement>()
        const b = createRef<HTMLDivElement>()
        const App = ({ id }: { id: string }) => (
            <>
                <motion.div ref={a} layoutId={id} />
                <motion.div ref={b} layoutId="shared" layoutDependency={1} />
            </>
        )
        const { rerender } = render(<App id="initial" />)
        const nodeB = getNode(b.current!)
        // Let any mount-time update settle so B starts clean
        await nextFrame()
        expect(nodeB.isLayoutDirty).toBe(false)

        rerender(<App id="shared" />)
        expect(nodeB.isLayoutDirty).toBe(true)
    })

    /**
     * MeasureLayout syncs its options on every update, so props like
     * layoutAnchor can change after mount.
     */
    test("keeps layoutAnchor in sync", () => {
        const ref = createRef<HTMLDivElement>()
        const { rerender } = render(
            <motion.div ref={ref} layout layoutAnchor={{ x: 0, y: 0 }} />
        )
        const node = getNode(ref.current!)
        expect(node.options.layoutAnchor).toEqual({ x: 0, y: 0 })

        rerender(<motion.div ref={ref} layout layoutAnchor={{ x: 1, y: 1 }} />)
        expect(node.options.layoutAnchor).toEqual({ x: 1, y: 1 })
    })

    test("namespaces the new layoutId by its LayoutGroup", async () => {
        const ref = createRef<HTMLDivElement>()
        const App = ({ id }: { id: string }) => (
            <LayoutGroup id="group">
                <motion.div ref={ref} layoutId={id} />
            </LayoutGroup>
        )
        const { rerender } = render(<App id="a" />)
        const node = getNode(ref.current!)
        const { sharedNodes } = node.root!

        rerender(<App id="b" />)
        await nextFrame()

        expect(sharedNodes.get("group-b")?.lead === node).toBe(true)
        expect((sharedNodes.get("group-a")?.members ?? []).includes(node)).toBe(
            false
        )
    })

    test("joins the new stack once in StrictMode", async () => {
        const ref = createRef<HTMLDivElement>()
        const { rerender } = render(
            <StrictMode>
                <motion.div ref={ref} layoutId="a" />
            </StrictMode>
        )
        const node = getNode(ref.current!)

        rerender(
            <StrictMode>
                <motion.div ref={ref} layoutId="b" />
            </StrictMode>
        )
        await nextFrame()

        const { members } = node.root!.sharedNodes.get("b")!
        expect(
            members.filter((member: unknown) => member === node).length
        ).toBe(1)
    })

    /**
     * With layoutCrossfade={false}, a new lead hides the previous one, as it
     * would usually be unmounting. One that keeps rendering without the
     * layoutId, or moves to another layoutId, must stay visible, whichever
     * order the two update in.
     */
    test.each([
        ["a", "b"],
        ["b", "a"],
    ])(
        "keeps an element visible after its layoutId moves to another (%s to %s)",
        async (from, to) => {
            const refs = {
                a: createRef<HTMLDivElement>(),
                b: createRef<HTMLDivElement>(),
            }
            const App = ({
                selected,
                other,
            }: {
                selected: string
                other?: string
            }) => (
                <>
                    {(["a", "b"] as const).map((id) => (
                        <motion.div
                            key={id}
                            ref={refs[id]}
                            layout
                            layoutCrossfade={false}
                            layoutId={selected === id ? "selected" : other}
                        />
                    ))}
                </>
            )
            const { rerender } = render(<App selected={from} />)
            const prev = refs[from as "a"].current!

            rerender(<App selected={to} />)
            await nextFrame()
            const visible = [prev.style.visibility]

            rerender(<App selected={from} />)
            await nextFrame()
            rerender(<App selected={to} other="other" />)
            await nextFrame()
            visible.push(prev.style.visibility)

            expect(visible).not.toContain("hidden")
        }
    )
})
