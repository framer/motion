import { sync } from "../../../../frameloop"
import { scroll } from "../index"
import { ScrollOffset } from "../offsets/presets"
import { ScrollInfo } from "../types"

type Measurements = {
    [key: string]: number
}

const measurements = new Map<Element, Measurements>()

async function frame() {
    return new Promise((resolve) => sync.postRender(resolve))
}

const createMockMeasurement = (element: Element, name: string) => {
    const elementMeasurements = measurements.get(element) || {}

    measurements.set(element, elementMeasurements)

    if (!element.hasOwnProperty(name)) {
        Object.defineProperty(element, name, {
            get: () => {
                return elementMeasurements[name] ?? 0
            },
            set: () => {},
        })
    }

    return (value: number) => {
        elementMeasurements[name] = value
    }
}

const setWindowHeight = createMockMeasurement(
    document.documentElement,
    "clientHeight"
)
const setDocumentHeight = createMockMeasurement(
    document.documentElement,
    "scrollHeight"
)
const setScrollTop = createMockMeasurement(
    document.documentElement,
    "scrollTop"
)

async function fireScroll(distance: number = 0) {
    setScrollTop(distance)
    window.dispatchEvent(new window.Event("scroll"))
    return frame()
}

describe("scroll", () => {
    test("Fires onScroll on creation.", async () => {
        const onScroll = jest.fn()

        const stopScroll = scroll(onScroll)

        return new Promise<void>((resolve) => {
            window.requestAnimationFrame(() => {
                expect(onScroll).toBeCalled()

                stopScroll()

                resolve()
            })
        })
    })

    test("Fires onScroll on scroll.", async () => {
        let latest: ScrollInfo

        const stopScroll = scroll((info) => {
            latest = info
        })

        setWindowHeight(1000)
        setDocumentHeight(3000)

        return new Promise<void>(async (resolve) => {
            await fireScroll(10)

            expect(latest.time).not.toEqual(0)
            expect(latest.y.current).toEqual(10)
            expect(latest.y.offset).toEqual([0, 2000])
            expect(latest.y.scrollLength).toEqual(2000)
            expect(latest.y.targetOffset).toEqual(0)
            expect(latest.y.targetLength).toEqual(3000)
            expect(latest.y.containerLength).toEqual(1000)
            expect(latest.y.progress).toEqual(0.005)

            await fireScroll(2000)

            expect(latest.y.current).toEqual(2000)
            expect(latest.y.offset).toEqual([0, 2000])
            expect(latest.y.scrollLength).toEqual(2000)
            expect(latest.y.targetOffset).toEqual(0)
            expect(latest.y.targetLength).toEqual(3000)
            expect(latest.y.containerLength).toEqual(1000)
            expect(latest.y.progress).toEqual(1)

            stopScroll()

            resolve()
        })
    })

    test("Fires onScroll on scroll with different container.", async () => {
        let latest: ScrollInfo

        const container = document.createElement("div")

        const setContainerHeight = createMockMeasurement(
            container,
            "clientHeight"
        )
        const setContainerLength = createMockMeasurement(
            container,
            "scrollHeight"
        )
        const setContainerScrollTop = createMockMeasurement(
            container,
            "scrollTop"
        )

        setContainerHeight(100)
        setContainerLength(1000)

        const fireElementScroll = async (distance: number = 0) => {
            setContainerScrollTop(distance)
            container.dispatchEvent(new window.Event("scroll"))
            await frame()
        }

        const stopScroll = scroll(
            (info) => {
                latest = info
            },
            { container }
        )

        return new Promise<void>(async (resolve) => {
            await fireElementScroll(100)

            expect(latest.time).not.toEqual(0)
            expect(latest.y.current).toEqual(100)
            expect(latest.y.offset).toEqual([0, 900])
            expect(latest.y.scrollLength).toEqual(900)
            expect(latest.y.targetOffset).toEqual(0)
            expect(latest.y.targetLength).toEqual(1000)
            expect(latest.y.containerLength).toEqual(100)
            expect(latest.y.progress).toBeCloseTo(0.1, 1)

            await fireElementScroll(450)

            expect(latest.y.current).toEqual(450)
            expect(latest.y.offset).toEqual([0, 900])
            expect(latest.y.scrollLength).toEqual(900)
            expect(latest.y.targetOffset).toEqual(0)
            expect(latest.y.targetLength).toEqual(1000)
            expect(latest.y.containerLength).toEqual(100)
            expect(latest.y.progress).toEqual(0.5)

            stopScroll()

            resolve()
        })
    })

    test("Fires onScroll on scroll with different container with child target.", async () => {
        let latest: ScrollInfo

        const container = document.createElement("div")
        const target = document.createElement("div")
        container.appendChild(target)

        const setContainerHeight = createMockMeasurement(
            container,
            "clientHeight"
        )
        const setContainerLength = createMockMeasurement(
            container,
            "scrollHeight"
        )
        const setContainerScrollTop = createMockMeasurement(
            container,
            "scrollTop"
        )
        const setTargetHeight = createMockMeasurement(target, "clientHeight")
        const setTargetOffsetTop = createMockMeasurement(target, "offsetTop")

        setContainerHeight(100)
        setContainerLength(1000)
        setTargetHeight(200)
        setTargetOffsetTop(100)

        async function fireElementScroll(distance: number = 0) {
            setContainerScrollTop(distance)
            container.dispatchEvent(new window.Event("scroll"))
            await frame()
        }

        const stopScroll = scroll(
            (info) => {
                latest = info
            },
            { container, target, offset: ScrollOffset.Enter }
        )

        return new Promise<void>(async (resolve) => {
            await frame()
            expect(latest.y.current).toEqual(0)
            expect(latest.y.offset).toEqual([0, 200])
            expect(latest.y.scrollLength).toEqual(900)
            expect(latest.y.targetOffset).toEqual(100)
            expect(latest.y.targetLength).toEqual(200)
            expect(latest.y.containerLength).toEqual(100)
            expect(latest.y.progress).toBeCloseTo(0, 1)

            await fireElementScroll(100)
            expect(latest.y.current).toEqual(100)
            expect(latest.y.offset).toEqual([0, 200])
            expect(latest.y.scrollLength).toEqual(900)
            expect(latest.y.targetOffset).toEqual(100)
            expect(latest.y.targetLength).toEqual(200)
            expect(latest.y.containerLength).toEqual(100)
            expect(latest.y.progress).toBeCloseTo(0.5)

            stopScroll()

            resolve()
        })
    })

    test("Fires onScroll on window scroll with child target.", async () => {
        await fireScroll(0)
        let latest: ScrollInfo

        const target = document.createElement("div")
        document.documentElement.appendChild(target)

        const setTargetHeight = createMockMeasurement(target, "clientHeight")
        const setTargetOffsetTop = createMockMeasurement(target, "offsetTop")

        setWindowHeight(100)
        setDocumentHeight(1000)
        setTargetHeight(200)
        setTargetOffsetTop(100)

        const stopScroll = scroll(
            (info) => {
                latest = info
            },
            { target, offset: ScrollOffset.Enter }
        )

        return new Promise<void>(async (resolve) => {
            await frame()

            expect(latest.y.current).toEqual(0)
            expect(latest.y.offset).toEqual([0, 200])
            expect(latest.y.scrollLength).toEqual(900)
            expect(latest.y.targetOffset).toEqual(100)
            expect(latest.y.targetLength).toEqual(200)
            expect(latest.y.containerLength).toEqual(100)
            expect(latest.y.progress).toBeCloseTo(0, 1)

            await fireScroll(100)
            expect(latest.y.current).toEqual(100)
            expect(latest.y.offset).toEqual([0, 200])
            expect(latest.y.scrollLength).toEqual(900)
            expect(latest.y.targetOffset).toEqual(100)
            expect(latest.y.targetLength).toEqual(200)
            expect(latest.y.containerLength).toEqual(100)
            expect(latest.y.progress).toBeCloseTo(0.5)

            stopScroll()

            resolve()
        })
    })

    test("Fires onScroll on resize.", async () => {
        let latest: ScrollInfo

        const stopScroll = scroll((info) => {
            latest = info
        })

        setWindowHeight(1000)
        setDocumentHeight(3000)

        return new Promise<void>(async (resolve) => {
            await fireScroll(500)

            expect(latest.time).not.toEqual(0)
            expect(latest.y.current).toEqual(500)
            expect(latest.y.offset).toEqual([0, 2000])
            expect(latest.y.scrollLength).toEqual(2000)
            expect(latest.y.targetOffset).toEqual(0)
            expect(latest.y.targetLength).toEqual(3000)
            expect(latest.y.containerLength).toEqual(1000)
            expect(latest.y.progress).toEqual(0.25)
            await frame()

            setWindowHeight(500)
            setDocumentHeight(6000)

            window.dispatchEvent(new window.Event("resize"))
            await frame()
            expect(latest.y.current).toEqual(500)
            expect(latest.y.targetLength).toEqual(6000)
            expect(latest.y.containerLength).toEqual(500)

            stopScroll()

            resolve()
        })
    })

    test("Fires onScroll on element resize.", async () => {
        let latest: ScrollInfo

        const container = document.createElement("div")

        const setContainerHeight = createMockMeasurement(
            container,
            "clientHeight"
        )
        const setContainerLength = createMockMeasurement(
            container,
            "scrollHeight"
        )
        const setContainerScrollTop = createMockMeasurement(
            container,
            "scrollTop"
        )

        setContainerHeight(100)
        setContainerLength(1000)

        const fireElementScroll = async (distance: number = 0) => {
            setContainerScrollTop(distance)
            container.dispatchEvent(new window.Event("scroll"))
            await frame()
        }

        const stopScroll = scroll(
            (info) => {
                latest = info
            },
            { container }
        )

        return new Promise<void>(async (resolve) => {
            await fireElementScroll(100)

            expect(latest.time).not.toEqual(0)
            expect(latest.y.current).toEqual(100)
            expect(latest.y.offset).toEqual([0, 900])
            expect(latest.y.scrollLength).toEqual(900)
            expect(latest.y.targetOffset).toEqual(0)
            expect(latest.y.targetLength).toEqual(1000)
            expect(latest.y.containerLength).toEqual(100)
            expect(latest.y.progress).toBeCloseTo(0.1, 1)
            await frame()
            setContainerHeight(500)
            setContainerLength(2000)

            window.dispatchEvent(new window.Event("resize"))
            await frame()
            expect(latest.y.current).toEqual(100)
            expect(latest.y.targetLength).toEqual(2000)
            expect(latest.y.containerLength).toEqual(500)

            stopScroll()

            resolve()
        })
    })
})
