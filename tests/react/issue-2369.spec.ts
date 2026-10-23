import { expect, test } from "@playwright/test"

/**
 * Issue #2369: once backgroundColor has animated to var(--on), it should
 * stay there when the scale spring started alongside it settles, rather
 * than jump back to var(--off). Every frame is recorded in the page.
 */
for (const [name, query] of [
    ["CSS variables", ""],
    ["literal colors (control)", "&literal=true"],
]) {
    test(`backgroundColor with ${name} doesn't jump back when a spring on scale settles`, async ({
        page,
    }) => {
        await page.goto(`?test=issue-2369${query}`)
        await expect(page.locator("#box")).toBeVisible()

        // The spring takes ~2.5s to settle
        await page.waitForTimeout(4000)

        const frames: string[] = await page.evaluate(
            () => (window as any).frames
        )
        const on = "rgb(0, 0, 255)"
        const reachedOn = frames.indexOf(on)

        expect(reachedOn).toBeGreaterThan(-1)
        expect(frames.slice(reachedOn).filter((c) => c !== on)).toEqual([])
    })
}
