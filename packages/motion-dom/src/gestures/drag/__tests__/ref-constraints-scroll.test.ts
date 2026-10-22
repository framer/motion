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

    test("follow the element as the container scrolls", async () => {
        const container = createElement()
        const element = createElement("div", container)
        let scrollTop = 0

        Object.defineProperty(container, "scrollTop", {
            get: () => scrollTop,
        })

        /**
         * The container is 300px tall at the top of the page and the
         * element is 60px tall, laid out 350px down its scrolled content.
         */
        const rect = (top: number, height: number) =>
            ({
                top,
                left: 0,
                right: 100,
                bottom: top + height,
                width: 100,
                height,
            } as DOMRect)

        jest.spyOn(
            HTMLElement.prototype,
            "getBoundingClientRect"
        ).mockImplementation(function (this: HTMLElement) {
            return this === element
                ? rect(350 - scrollTop + values(element).y, 60)
                : rect(0, 300)
        })

        stop = drag(element, {
            axis: "y",
            constraints: container,
            elastic: false,
            momentum: false,
        })
        await nextFrame()

        // The element's top is now 150px into the container
        scrollTop = 200

        const pointer = await gesture(element).to(0, 1)
        await pointer.to(0, 20)
        expect(values(element).y).toBe(20)

        // Clamped at the container's top and bottom
        await pointer.to(0, -500)
        expect(values(element).y).toBe(-150)
        await pointer.to(0, 500)
        expect(values(element).y).toBe(90)
        pointer.end()
    })
})
