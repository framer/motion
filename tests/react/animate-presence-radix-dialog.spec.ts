import { expect, test } from "@playwright/test"

/**
 * Playwright mirror of
 * packages/framer-motion/cypress/integration/animate-presence-radix-dialog.ts
 *
 * #3455: Radix's asChild hands motion components a new callback ref every
 * render. That must not remount the VisualElement, or exit animations break.
 */
test.describe("AnimatePresence with Radix UI Dialog", () => {
    test("exit animations run and complete with Radix Dialog asChild", async ({
        page,
    }) => {
        await page.goto("?test=animate-presence-radix-dialog")
        await page.click("#trigger")
        await page.waitForTimeout(500)

        const overlay = page.locator("#overlay")
        const dialog = page.locator("#dialog")
        await expect(overlay).toBeAttached()
        await expect(dialog).toBeAttached()

        // Close, then sample the overlay's opacity every frame until it's removed
        const opacities = await page.evaluate(
            () =>
                new Promise<number[]>((resolve) => {
                    const element = document.getElementById("overlay")!
                    const values: number[] = []
                    const start = performance.now()
                    const sample = () => {
                        if (
                            !element.isConnected ||
                            performance.now() - start > 2000
                        ) {
                            return resolve(values)
                        }
                        values.push(
                            parseFloat(getComputedStyle(element).opacity)
                        )
                        requestAnimationFrame(sample)
                    }
                    document.getElementById("close")!.click()
                    requestAnimationFrame(sample)
                })
        )

        // It animated out, rather than being removed or snapping to its target
        expect(opacities.some((opacity) => opacity > 0 && opacity < 1)).toBe(
            true
        )

        await expect(page.locator("#exit-complete")).toHaveAttribute(
            "data-value",
            "true"
        )
        await expect(overlay).not.toBeAttached()
        await expect(dialog).not.toBeAttached()
    })
})
