/**
 * #3955: Reorder auto-scroll moved a fixed number of pixels per frame, so
 * it scrolled twice as fast at 120Hz as at 60Hz. It should scroll at the
 * same speed, in pixels per second, whatever the frame rate.
 */
import { expect, Page, test } from "@playwright/test"
import { frames } from "../gestures/drag-helpers"

/**
 * Hold Item 3 10px above the bottom edge of the viewport and return how
 * fast the page auto-scrolls, in pixels per second.
 */
async function autoScrollSpeed(page: Page, fps?: number) {
    if (fps) {
        /**
         * Throttle requestAnimationFrame before Motion loads, as its
         * frameloop captures requestAnimationFrame on import.
         */
        await page.addInitScript((fps) => {
            const raf = window.requestAnimationFrame.bind(window)
            const interval = 1000 / fps
            let last = 0
            window.requestAnimationFrame = (callback) => {
                // Every callback in an allowed frame runs, so none starve
                const tick = (timestamp: number) => {
                    if (timestamp !== last && timestamp - last < interval - 2) {
                        return raf(tick)
                    }
                    last = timestamp
                    callback(timestamp)
                }
                return raf(tick)
            }
        }, fps)
    }

    await page.goto("?test=issue-3955")
    await expect(page.locator("#item-3")).toBeVisible()
    await frames(page, 2)

    const { innerHeight, itemTop } = await page.evaluate(() => ({
        innerHeight: window.innerHeight,
        itemTop: document.getElementById("item-3")!.getBoundingClientRect().top,
    }))

    const x = 150
    const edgeY = innerHeight - 10
    await page.mouse.move(x, itemTop + 25)
    await page.mouse.down()
    await frames(page, 1)
    await page.mouse.move(x, itemTop + 35)
    await frames(page, 1)
    await page.mouse.move(x, edgeY, { steps: 20 })

    // Let auto-scroll get going, then measure over a second of holding still
    await page.waitForTimeout(300)
    const start = await page.evaluate(() => [window.scrollY, performance.now()])
    await page.waitForTimeout(1000)
    const end = await page.evaluate(() => [window.scrollY, performance.now()])

    await page.mouse.up()

    const speed = ((end[0] - start[0]) / (end[1] - start[1])) * 1000
    expect(speed).toBeGreaterThan(0)
    return speed
}

test("Reorder auto-scroll speed doesn't depend on the frame rate", async ({
    browser,
}) => {
    const native = await browser.newPage()
    const throttled = await browser.newPage()

    const nativeSpeed = await autoScrollSpeed(native)
    const throttledSpeed = await autoScrollSpeed(throttled, 30)

    await native.close()
    await throttled.close()

    // Per-frame scrolling made 60fps twice as fast as 30fps
    expect(throttledSpeed / nativeSpeed).toBeGreaterThan(0.75)
    expect(throttledSpeed / nativeSpeed).toBeLessThan(1.33)
})
