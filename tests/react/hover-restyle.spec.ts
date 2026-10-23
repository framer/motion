import { expect, Page, test } from "@playwright/test"

/**
 * Found while investigating #2369. A whileHover value with a static style
 * fallback, on a component that re-renders on hover end, stopped after the
 * first frame of the hover-out animation.
 */
async function hoverOut(page: Page, restyle: boolean) {
    await page.goto(`?test=hover-restyle&restyle=${restyle}`)
    const box = page.locator("#box")
    await box.waitFor()
    const b = (await box.boundingBox())!

    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
    await expect
        .poll(() => box.evaluate((el) => getComputedStyle(el).backgroundColor))
        .toBe("rgb(255, 0, 0)")

    await page.evaluate(() => (window.bgFrames.length = 0))
    await page.mouse.move(b.x + b.width / 2, b.y + b.height + 200)
    await expect(box).toHaveAttribute("data-count", "1")
    await page.waitForTimeout(1000)

    const frames: string[] = await page.evaluate(() => window.bgFrames)
    return frames
}

test("whileHover animates back to style after a re-render on hover end", async ({
    page,
}) => {
    const reds = (await hoverOut(page, false)).map((color) =>
        Number(color.match(/\d+/)![0])
    )

    // Ends back at the style value...
    expect(reds[reds.length - 1]).toBe(0)

    // ...by animating there, not jumping
    let maxStep = 0
    for (let i = 1; i < reds.length; i++) {
        maxStep = Math.max(maxStep, Math.abs(reds[i] - reds[i - 1]))
    }
    expect(maxStep).toBeLessThan(128)
})

test("whileHover ends at a style value changed on hover end", async ({
    page,
}) => {
    const frames = await hoverOut(page, true)
    expect(frames[frames.length - 1]).toBe("rgb(0, 128, 0)")
})
