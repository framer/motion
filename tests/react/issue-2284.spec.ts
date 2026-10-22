import { expect, test } from "@playwright/test"

/**
 * Issue #2284: when a shared layoutId element also animates `scale`,
 * the element grows larger than its final size during the layout
 * animation and then snaps back to the correct size at the end.
 */
for (const mode of ["default", "linear", "static"]) {
    test(`shared layout + scale never exceeds final size (${mode})`, async ({
        page,
    }) => {
        await page.goto(
            `/?test=issue-2284${mode === "default" ? "" : "&" + mode}`
        )
        await page.locator("#card").click()
        await page.waitForSelector("#modal")

        const widths: number[] = await page.evaluate(
            () =>
                new Promise<number[]>((resolve) => {
                    const samples: number[] = []
                    const start = performance.now()
                    const sample = () => {
                        const el = document.getElementById("modal")!
                        samples.push(el.getBoundingClientRect().width)
                        if (performance.now() - start < 3000) {
                            requestAnimationFrame(sample)
                        } else {
                            resolve(samples)
                        }
                    }
                    requestAnimationFrame(sample)
                })
        )

        const finalWidth = widths[widths.length - 1]

        if (mode === "static") {
            // Both boxes are 100px wide with scale: 0.5, so the shared
            // element should stay 50px wide throughout.
            for (const width of widths) expect(width).toBeCloseTo(50, 0)
            return
        }

        // Final rendered size is the 100px box scaled by 1.5
        expect(finalWidth).toBeCloseTo(150, 0)

        const max = Math.max(...widths)
        if (mode === "linear") {
            // Linear scale: the width grows steadily to its final size
            expect(max).toBeLessThanOrEqual(finalWidth + 1)
            for (let i = 1; i < widths.length; i++) {
                expect(widths[i]).toBeGreaterThanOrEqual(widths[i - 1] - 1)
            }
        } else {
            // The default scale spring may overshoot slightly, but with
            // scale applied twice the box reaches ~225px (1.5 * 1.5).
            expect(max).toBeLessThanOrEqual(finalWidth * 1.05)
        }
    })
}
