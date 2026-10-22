/**
 * Regression coverage for #2514 (and #1972).
 *
 * When a `layoutId` element is swapped for another in the same render, the
 * outgoing element used to be snapshotted when it unmounted. That happens
 * during React's commit, after React has already applied DOM changes that
 * come before it in the tree, so a sibling changing height in the same
 * render shifted the snapshot, and the incoming element animated from a
 * position the outgoing one never occupied on screen.
 *
 * JSDOM has no layout, so getBoundingClientRect is mocked. Boxes are derived
 * from the DOM, so a read reflects whatever React has committed so far.
 */

import { frame, visualElementStore } from "motion-dom"
import type { IProjectionNode } from "motion-dom"
import { act, createRef, memo, Suspense } from "react"
import { render } from "../../jest.setup"
import { motion } from "../../render/components/motion"

const itemHeight = 52

function box(top: number, height: number) {
    return {
        x: 0,
        y: top,
        top,
        left: 0,
        width: 100,
        height,
        right: 100,
        bottom: top + height,
        toJSON() {},
    } as DOMRect
}

/**
 * #content comes first and its height pushes the nav down. Each item is
 * itemHeight tall, and the indicator is a 4px bar along the bottom of its item.
 */
function rect(element: HTMLElement): DOMRect {
    const navTop =
        parseFloat(document.getElementById("content")?.style.height || "") ||
        0
    const item = element.closest<HTMLElement>("[data-index]")

    if (!item) return box(0, 0)

    const top = navTop + Number(item.dataset.index) * itemHeight
    return element === item ? box(top, itemHeight) : box(top + itemHeight - 4, 4)
}

const transition = { type: "tween", ease: "linear", duration: 10 } as const

function App({ selected }: { selected: number }) {
    return (
        <div>
            <div id="content" style={{ height: (selected + 1) * 100 }} />
            {[0, 1, 2].map((index) => (
                <div key={index} data-index={index}>
                    {selected === index && (
                        <motion.div
                            id="indicator"
                            layoutId="indicator"
                            transition={transition}
                        />
                    )}
                </div>
            ))}
        </div>
    )
}

async function nextFrame() {
    return new Promise<void>((resolve) => {
        frame.postRender(() => resolve())
    })
}

async function frames(count: number) {
    for (let i = 0; i < count; i++) await nextFrame()
}

/**
 * The indicator's current on-screen top: its layout plus its projection
 * transform.
 */
function visualTop() {
    const element = document.getElementById("indicator")!
    const translateY = parseFloat(element.style.transform.split(",")[1]) || 0
    return rect(element).top + translateY
}

const getNode = (element: Element) =>
    visualElementStore.get(element)!.projection as IProjectionNode

describe("layoutId swap snapshots the outgoing element before React commits (#2514)", () => {
    beforeEach(() => {
        jest.spyOn(
            HTMLElement.prototype,
            "getBoundingClientRect"
        ).mockImplementation(function (this: HTMLElement) {
            return rect(this)
        })
    })

    afterEach(() => jest.restoreAllMocks())

    test("animates from where the outgoing element was on screen", async () => {
        const { rerender } = render(<App selected={0} />)
        await frames(2)

        const from = visualTop()
        expect(from).toBe(100 + itemHeight - 4)

        await act(async () => rerender(<App selected={2} />))
        await frames(2)

        // A 10s linear animation has barely started, so the indicator should
        // still be (almost) where the outgoing one was, not shifted down by
        // the 200px that #content grew by.
        expect(Math.abs(visualTop() - from)).toBeLessThan(5)
    })

    test("a discarded render doesn't leave the lead mid-update", async () => {
        const lead = createRef<HTMLDivElement>()
        const never = new Promise<void>(() => {})

        const Suspend = (): null => {
            throw never
        }

        // Memoized, so nothing but the discarded render touches it.
        const Lead = memo(() => <motion.div ref={lead} layoutId="box" />)

        const Modal = ({ open }: { open: boolean }) => (
            <div data-index={0}>
                <div id="content" style={{ height: 100 }} />
                <Lead />
                {open && (
                    <Suspense fallback={null}>
                        <motion.div layoutId="box" />
                        <Suspend />
                    </Suspense>
                )}
            </div>
        )

        const { rerender } = render(<Modal open={false} />)
        await frames(2)

        const node = getNode(lead.current!)

        // The new layoutId member renders, then its boundary suspends, so
        // React throws that render away and the member never mounts.
        await act(async () => rerender(<Modal open />))
        await frames(2)

        expect(node.root!.sharedNodes.get("box")!.lead).toBe(node)
        expect(node.snapshot).toBeUndefined()
        expect(node.isLayoutDirty).toBe(false)
        expect(node.root!.isUpdating).toBe(false)
    })
})
