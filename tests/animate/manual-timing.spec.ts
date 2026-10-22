import { expect, test } from "@playwright/test"

/**
 * With useManualTiming, processFrame must drive every animation, including
 * values Motion would otherwise hand to WAAPI on the browser's clock.
 */
test("manual timing renders WAAPI-eligible values frame by frame", async ({
    page,
}) => {
    await page.goto("animate/manual-timing-frames.html")
    await page.waitForFunction(() => (window as any).ready)
    const box = page.locator("#box")

    const read = (t: number) =>
        box.evaluate((el, time) => {
            ;(window as any).renderFrame(time)
            const style = getComputedStyle(el)
            return {
                opacity: style.opacity,
                transform: style.transform,
                filter: style.filter,
                animations: el.getAnimations().length,
            }
        }, t)

    // Real time passing must not move anything
    await page.waitForTimeout(300)
    expect(await read(0)).toEqual({
        opacity: "0",
        transform: "none",
        filter: "blur(0px)",
        animations: 0,
    })

    expect(await read(500)).toEqual({
        opacity: "0.5",
        transform: "matrix(1, 0, 0, 1, 50, 0)",
        filter: "blur(5px)",
        animations: 0,
    })

    expect(await read(750)).toMatchObject({
        opacity: "0.75",
        transform: "matrix(1, 0, 0, 1, 75, 0)",
    })

    // Scrubbing back
    expect(await read(250)).toMatchObject({ opacity: "0.25" })
})
