import { autoScrollIfNeeded, resetAutoScrollState } from "../auto-scroll"

/**
 * JSDOM has no layout, so give a page-scrolling document a 2000px tall
 * body inside a 768px viewport (JSDOM's default innerHeight).
 */
describe("autoScrollIfNeeded", () => {
    let group: HTMLElement
    let scrollBy: jest.Mock

    beforeEach(() => {
        group = document.createElement("ul")
        document.body.appendChild(group)
        document.body.getBoundingClientRect = () =>
            ({ top: 0, left: 0, bottom: 2000, right: 1024 } as DOMRect)
        Object.defineProperty(document.body, "scrollHeight", {
            value: 2000,
            configurable: true,
        })
        scrollBy = jest.fn()
        window.scrollBy = scrollBy
    })

    afterEach(() => {
        resetAutoScrollState()
        document.body.innerHTML = ""
    })

    const lastScroll = () => scrollBy.mock.calls.at(-1)[0].top

    test("scrolls faster the closer the pointer is to the edge", () => {
        autoScrollIfNeeded(group, window.innerHeight - 25, "y", 1)
        expect(lastScroll()).toBeCloseTo(6.25)

        autoScrollIfNeeded(group, window.innerHeight - 2, "y", 1)
        expect(lastScroll()).toBeCloseTo(23.04)
    })

    test("never scrolls past maxSpeed when the pointer is beyond the end edge", () => {
        autoScrollIfNeeded(group, window.innerHeight + 100, "y", 1)
        expect(lastScroll()).toBe(25)
    })

    test("never scrolls past maxSpeed when the pointer is beyond the start edge", () => {
        Object.defineProperty(window, "scrollY", {
            value: 500,
            configurable: true,
        })
        try {
            // Page point 400 is 100px above the top of the viewport
            autoScrollIfNeeded(group, 400, "y", -1)
            expect(lastScroll()).toBe(-25)
        } finally {
            Object.defineProperty(window, "scrollY", {
                value: 0,
                configurable: true,
            })
        }
    })
})
