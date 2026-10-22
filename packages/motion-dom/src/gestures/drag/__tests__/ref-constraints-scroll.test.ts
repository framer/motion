import { drag } from ".."
import { createElement, gesture, nextFrame, values } from "./utils"

/**
 * #2024: An element dragged within element constraints, inside a scroll
 * container (here, the constraints element itself), jumped when the
 * container was scrolled before dragging. Its constraints were measured from
 * its layout, which doesn't follow the container's scroll.
 */
describe("element constraints in a scrolled container", () => {
    let stop: VoidFunction | undefined

    afterEach(() => {
        stop?.()
        jest.restoreAllMocks()
        document.body.innerHTML = ""
    })

    const rect = (top: number, height: number) =>
        ({
            top,
            left: 0,
            right: 100,
            bottom: top + height,
            width: 100,
            height,
        } as DOMRect)

    const mockScroll = (element: HTMLElement) => {
        let scrollTop = 0
        Object.defineProperty(element, "scrollTop", { get: () => scrollTop })
        return (top: number) => (scrollTop = top)
    }

    /**
     * Mock layout: the constraints element is 300px tall and the dragged
     * element 60px tall, laid out `top()` px down the page.
     */
    const mockLayout = (
        constraints: HTMLElement,
        constraintsTop: () => number,
        element: HTMLElement,
        top: () => number
    ) =>
        jest
            .spyOn(HTMLElement.prototype, "getBoundingClientRect")
            .mockImplementation(function (this: HTMLElement) {
                if (this === element) {
                    return rect(top() + values(element).y, 60)
                }
                return this === constraints
                    ? rect(constraintsTop(), 300)
                    : rect(0, 0)
            })

    /**
     * The element's top is 150px into its 300px constraints, so it can move
     * 150px up and 90px down.
     */
    const expectFollowsPointerWithinConstraints = async (
        element: HTMLElement
    ) => {
        const pointer = await gesture(element).to(0, 1)
        await pointer.to(0, 20)
        expect(values(element).y).toBe(20)

        await pointer.to(0, -500)
        expect(values(element).y).toBe(-150)
        await pointer.to(0, 500)
        expect(values(element).y).toBe(90)
        pointer.end()
    }

    const dragWithin = (element: HTMLElement, constraints: HTMLElement) =>
        drag(element, {
            axis: "y",
            constraints,
            elastic: false,
            momentum: false,
        })

    test("follow the element as the constraints element scrolls", async () => {
        const container = createElement()
        const element = createElement("div", container)
        const scrollContainer = mockScroll(container)

        // Laid out 350px down the container's scrolled content
        mockLayout(
            container,
            () => 0,
            element,
            () => 350 - container.scrollTop
        )

        stop = dragWithin(element, container)
        await nextFrame()

        scrollContainer(200)

        await expectFollowsPointerWithinConstraints(element)
    })

    test("follow the element as a scroller within the constraints scrolls", async () => {
        const container = createElement()
        const scroller = createElement("div", container)
        const element = createElement("div", scroller)
        const scrollContainer = mockScroll(container)
        const scrollScroller = mockScroll(scroller)

        mockLayout(
            container,
            () => 0,
            element,
            () => 350 - container.scrollTop - scroller.scrollTop
        )

        stop = dragWithin(element, container)
        await nextFrame()

        scrollContainer(120)
        scrollScroller(80)

        await expectFollowsPointerWithinConstraints(element)
    })

    test("are unchanged by scroll that moves the constraints element too", async () => {
        const outer = createElement()
        const container = createElement("div", outer)
        const element = createElement("div", container)
        const scrollOuter = mockScroll(outer)

        mockLayout(
            container,
            () => 100 - outer.scrollTop,
            element,
            () => 250 - outer.scrollTop
        )

        stop = dragWithin(element, container)
        await nextFrame()

        scrollOuter(200)

        await expectFollowsPointerWithinConstraints(element)
    })
})
