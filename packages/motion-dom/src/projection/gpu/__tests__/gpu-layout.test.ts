import { frame } from "../../../frameloop"
import { animateLayout } from "../../../layout/animate-layout"
import {
    createLayoutPlane,
    LayoutPlane,
    LayoutPlaneSource,
} from "../../../layout/layout-plane"
import { layoutEngine, setLayoutEngine } from "../../node/layout-engine"
import { createGPULayout, GPULayout } from "../gpu-layout"

/**
 * JSDOM has no WebGPU, so these cover the engine without it. The WebGPU
 * path runs in Playwright: tests/quad-projection/quad-projection.gpu.spec.ts.
 */
function nextFrame() {
    return new Promise<void>((resolve) => frame.postRender(() => resolve()))
}

interface Render {
    transform?: Float64Array
    opacity: number
    visible: boolean
}

function createSource(quad: number[]) {
    const renders: Render[] = []
    const source: LayoutPlaneSource = {
        measure: (out) => (out.set(quad), true),
        track: (out) => (out.set(quad), true),
        render: (transform, opacity, visible) => {
            renders.push({ transform, opacity, visible })
        },
    }
    return { source, last: () => renders[renders.length - 1] }
}

function createCard() {
    const card = document.createElement("div")
    card.setAttribute("data-layout-id", "card")
    card.getBoundingClientRect = () =>
        ({
            left: 40,
            top: 60,
            right: 200,
            bottom: 160,
            width: 160,
            height: 100,
            x: 40,
            y: 60,
        } as DOMRect)
    return card
}

/**
 * A plane turned away from the viewer, which only quad projection can
 * animate to or from.
 */
const planeCorners = [420, 210, 610, 240, 600, 330, 430, 350]

async function seek(controls: { time: number }, time: number) {
    controls.time = time
    await nextFrame()
}

describe("createGPULayout without WebGPU", () => {
    let engine: GPULayout
    const planes: LayoutPlane[] = []
    const plane = (source: LayoutPlaneSource, visible = true) => {
        const created = createLayoutPlane(source, { layoutId: "card", visible })
        planes.push(created)
        return created
    }

    beforeEach(() => {
        engine = createGPULayout()
        setLayoutEngine(engine)
    })

    afterEach(async () => {
        planes.forEach((created) => created.hide())
        planes.length = 0
        await animateLayout(() => (document.body.innerHTML = ""))
        await nextFrame()
        setLayoutEngine()
    })

    test("reports that it can't compute", async () => {
        expect(await engine.ready).toBe(false)
        await engine.flush()
    })

    test("stays installed when animateLayout and planes would install one", async () => {
        plane(createSource(planeCorners).source)
        await animateLayout(() => {})
        expect(layoutEngine).toBe(engine)
    })

    test("finishes a hand over from an element to a plane instantly", async () => {
        const card = createCard()
        document.body.appendChild(card)

        const { source, last } = createSource(planeCorners)
        const created = plane(source, false)

        const controls = await animateLayout(
            () => {
                card.remove()
                created.show()
            },
            { duration: 10, ease: "linear" }
        )
        controls.pause()

        for (const time of [0, 5]) {
            await seek(controls, time)
            expect(last()).toEqual({
                transform: undefined,
                opacity: 1,
                visible: true,
            })
        }
    })

    test("finishes a hand over from a plane to an element instantly", async () => {
        const { source, last } = createSource(planeCorners)
        const created = plane(source)
        await nextFrame()

        const card = createCard()
        const controls = await animateLayout(
            () => {
                document.body.appendChild(card)
                created.hide()
            },
            { duration: 10, ease: "linear" }
        )
        controls.pause()

        for (const time of [0, 5]) {
            await seek(controls, time)
            expect(card.style.transform).not.toContain("matrix3d")
            expect(card.style.opacity).toBe("1")
            expect(last().visible && last().opacity > 0).toBe(false)
        }
    })
})
