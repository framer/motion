import { nextFrame, pointer } from "../../drag/__tests__/utils"
import { PanSession } from "../PanSession"
import type { PanInfo } from "../types"

/**
 * JSDOM never scrolls, so drive window.scrollX/Y by hand and fire the
 * scroll event ourselves. Browsers update scrollY synchronously but only
 * dispatch the scroll event in the next frame's rendering steps, so a
 * pointermove handled in between already includes the new scroll in its
 * pageX/pageY.
 */
function setWindowScroll(x: number, y: number) {
    Object.defineProperty(window, "scrollX", { value: x, configurable: true })
    Object.defineProperty(window, "scrollY", { value: y, configurable: true })
}

function fireWindowScroll() {
    window.dispatchEvent(new Event("scroll"))
}

describe("PanSession window scroll compensation", () => {
    let session: PanSession | undefined
    let points: PanInfo["point"][]

    beforeEach(() => {
        setWindowScroll(0, 0)
        points = []
        const element = document.createElement("div")
        document.body.appendChild(element)

        const down = new Event("pointerdown") as PointerEvent
        Object.assign(down, {
            isPrimary: true,
            button: 0,
            pageX: 100,
            pageY: 100,
        })

        session = new PanSession(
            down,
            { onMove: (_, { point }) => points.push({ ...point }) },
            { element }
        )
    })

    afterEach(() => {
        session?.end()
        session = undefined
        setWindowScroll(0, 0)
        document.body.innerHTML = ""
    })

    const lastPoint = () => points[points.length - 1]

    test("keeps the point under a stationary pointer while the window scrolls", async () => {
        pointer(window, "pointermove", 100, 150)
        await nextFrame()
        expect(lastPoint()).toEqual({ x: 100, y: 150 })

        setWindowScroll(0, 100)
        fireWindowScroll()
        await nextFrame()

        expect(lastPoint()).toEqual({ x: 100, y: 250 })
    })

    test("doesn't count a scroll twice when a pointermove already includes it", async () => {
        pointer(window, "pointermove", 100, 150)
        await nextFrame()

        // The window scrolls by 100px, then a pointermove (pointer held
        // still) is handled before the scroll event fires. Its pageY
        // already includes the new scroll.
        setWindowScroll(0, 100)
        pointer(window, "pointermove", 100, 250)
        fireWindowScroll()
        await nextFrame()

        expect(lastPoint()).toEqual({ x: 100, y: 250 })
    })

    test("doesn't count a horizontal scroll twice either", async () => {
        pointer(window, "pointermove", 150, 100)
        await nextFrame()

        setWindowScroll(40, 0)
        pointer(window, "pointermove", 190, 100)
        fireWindowScroll()
        await nextFrame()

        expect(lastPoint()).toEqual({ x: 190, y: 100 })
    })

    test("compensates only the scroll after the last pointermove", async () => {
        pointer(window, "pointermove", 100, 150)
        await nextFrame()

        // 100px of scroll lands in the pointermove, 30px more arrives
        // before the scroll event.
        setWindowScroll(0, 100)
        pointer(window, "pointermove", 100, 250)
        setWindowScroll(0, 130)
        fireWindowScroll()
        await nextFrame()

        expect(lastPoint()).toEqual({ x: 100, y: 280 })

        // Later scrolls with the pointer held still are still compensated
        setWindowScroll(0, 180)
        fireWindowScroll()
        await nextFrame()

        expect(lastPoint()).toEqual({ x: 100, y: 330 })
    })

    test("doesn't drift over repeated scroll and pointermove rounds", async () => {
        pointer(window, "pointermove", 100, 150)
        await nextFrame()

        // Pointer held at clientY 150 while the page keeps scrolling,
        // with each pointermove handled before its scroll event.
        for (let scrollY = 20; scrollY <= 200; scrollY += 20) {
            setWindowScroll(0, scrollY)
            pointer(window, "pointermove", 100, 150 + scrollY)
            fireWindowScroll()
            await nextFrame()
            expect(lastPoint().y).toBe(150 + scrollY)
        }
    })
})
