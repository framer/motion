/**
 * https://github.com/motiondivision/motion/issues/1827
 *
 * When dragConstraints is a ref, constraints should be recalculated when the
 * draggable element (or the constraints container) changes size after the
 * initial render. After clicking the toggle button and dragging the box far to
 * the right, the box's right edge should stop exactly at the container's
 * right edge.
 *
 * Size changes (box width / container width) are handled via ResizeObserver
 * (#2458). Scale changes the box the drag transform moves without resizing
 * it, so constraints must apply the draggable's current scale: whether set
 * by a re-render (`scale`, `scale-center`, `scale-rerender`) or a motion
 * value (`scale-value`), and whether it was there from the first render
 * (`scale-initial`). `object` swaps `false` for object constraints.
 *
 * Gesture scales (`while-*`) are transient, so the box must come to rest
 * against the constraint once they end: constraints use the scale the
 * element rests at, not the one a gesture is animating.
 */
import { expect, Page, test } from "@playwright/test"

async function drag(page: Page, dx: number) {
    const start = (await page.locator("#box").boundingBox())!
    const x = start.x + 10
    const y = start.y + 10
    /**
     * Pause after hovering and pressing, so whileHover and whileTap scales
     * have settled when the drag starts.
     */
    await page.mouse.move(x, y)
    await page.waitForTimeout(300)
    await page.mouse.down()
    await page.waitForTimeout(300)
    await page.mouse.move(x + 20, y, { steps: 2 })
    await page.mouse.move(x + dx, y, { steps: 10 })
    await page.waitForTimeout(100)
    await page.mouse.up()
    /**
     * Move off the box so gesture scales (whileHover) end, and wait for
     * them to settle.
     */
    await page.mouse.move(900, 650)
    await page.waitForTimeout(600)
}

async function dragFarRight(
    page: Page,
    mode: string,
    toggle: boolean,
    preDrag = false
) {
    await page.goto(`?test=issue-1827&mode=${mode}`)
    const box = page.locator("#box")
    await expect(box).toBeVisible()
    await page.waitForTimeout(200)
    if (preDrag) await drag(page, 100)
    if (toggle) {
        await page.click("#toggle")
        await page.waitForTimeout(300)
    }
    await drag(page, 900)
    return page.evaluate(() => ({
        box: document.getElementById("box")!.getBoundingClientRect().right,
        width: document.getElementById("box")!.getBoundingClientRect().width,
        cw: document.getElementById("constraints")!.getBoundingClientRect()
            .width,
        container: document
            .getElementById("constraints")!
            .getBoundingClientRect().right,
    }))
}

for (const [mode, toggle, preDrag] of [
    ["none", false, false],
    ["scale-initial", false, false],
    ["box", true, false],
    ["container", true, false],
    ["scale", true, false],
    ["box", true, true],
    ["container", true, true],
    ["scale", true, true],
    ["scale-center", true, false],
    ["scale-rerender", true, false],
    ["scale-value", true, false],
    ["scale-value", true, true],
    ["object", true, false],
    ["object", true, true],
    ["while-tap", false, false],
    ["while-drag", false, false],
    ["while-drag-rerender", false, false],
    ["while-hover", false, false],
] as const) {
    test(`issue #1827: mode=${mode} toggled=${toggle} preDrag=${preDrag} stays within constraints`, async ({
        page,
    }) => {
        const { box, container, width, cw } = await dragFarRight(
            page,
            mode,
            toggle,
            preDrag
        )
        if (mode === "box") expect(width).toBeCloseTo(300, 0)
        if (mode.startsWith("scale")) expect(width).toBeCloseTo(200, 0)
        if (mode.startsWith("while")) expect(width).toBeCloseTo(100, 0)
        if (mode === "container") expect(cw).toBeCloseTo(300, 0)
        expect(box).toBeLessThanOrEqual(container + 1)
        expect(box).toBeGreaterThanOrEqual(container - 1)
    })
}
