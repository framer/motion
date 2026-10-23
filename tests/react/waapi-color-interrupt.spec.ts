/**
 * Found while investigating https://github.com/motiondivision/motion/issues/2369
 *
 * backgroundColor runs on WAAPI, and the browser interpolates it in sRGB
 * with premultiplied alpha. When it's interrupted, Motion estimates the
 * current colour from a JS copy of the animation. That copy mixed colours
 * in linear light, so the new animation started from a different colour
 * to the one on screen and the colour visibly jumped.
 *
 * The page records the rendered colour every frame. Premultiplied channels
 * move linearly in time on both sides of the interrupt, so no frame-to-frame
 * change should exceed the animation's speed.
 */
import { expect, test } from "@playwright/test"

type Frame = [number, string]

/**
 * Premultiplied [r, g, b, a], all 0-255, of a computed rgb()/rgba() colour.
 */
function premultiplied(color: string) {
    const [r, g, b, a = 1] = color.match(/[\d.]+/g)!.map(Number)
    return [r * a, g * a, b * a, a * 255]
}

const cases = [
    { from: "rgb(255, 0, 0)", to: "rgb(0, 0, 255)" },
    { from: "rgba(255, 0, 0, 0.2)", to: "rgb(0, 0, 255)" },
]

test.describe("WAAPI color animation interrupted midway", () => {
    for (const { from, to } of cases) {
        test(`${from} -> ${to} continues from the rendered colour`, async ({
            page,
        }) => {
            await page.goto(
                `?test=waapi-color-interrupt&from=${encodeURIComponent(
                    from
                )}&to=${encodeURIComponent(to)}`
            )
            await expect(page.locator("#box")).toBeVisible()
            await page.waitForTimeout(2100)

            const frames: Frame[] = await page.evaluate(
                () => window.colorFrames
            )
            expect(frames.length).toBeGreaterThan(20)

            const values = frames.map(([, color]) => premultiplied(color))

            /**
             * Check the animation was actually interrupted partway: blue
             * rose, then returned to the start colour.
             */
            const blues = values.map(([, , blue]) => blue)
            const peak = Math.max(...blues)
            expect(peak).toBeGreaterThan(60)
            expect(peak).toBeLessThan(220)
            expect(blues[blues.length - 1]).toBe(0)

            /**
             * Each premultiplied channel moves at most 255 per second. Allow
             * 20% for clock differences, plus a little for rounding.
             */
            const jumps: string[] = []
            for (let i = 1; i < frames.length; i++) {
                const elapsed = frames[i][0] - frames[i - 1][0]
                const limit = 0.255 * elapsed * 1.2 + 4
                for (let c = 0; c < 4; c++) {
                    const delta = Math.abs(values[i][c] - values[i - 1][c])
                    if (delta > limit) {
                        jumps.push(
                            `${frames[i - 1][1]} -> ${
                                frames[i][1]
                            } in ${elapsed.toFixed(1)}ms`
                        )
                        break
                    }
                }
            }

            expect(jumps).toEqual([])
        })
    }
})
