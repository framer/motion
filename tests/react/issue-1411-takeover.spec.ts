/**
 * https://github.com/motiondivision/motion/issues/1411
 *
 * When element A's layoutId changes to one that element B already leads, A
 * takes over from B as if it had mounted with that layoutId: A animates from
 * B's box, and B follows A (projected onto A's box, crossfading out). B is a
 * sibling that doesn't re-render for the change (constant layoutDependency,
 * as a memoised item wouldn't re-render at all), so the takeover itself must
 * mark B for measurement, as mounting with the layoutId does.
 */
import { expect, test } from "@playwright/test"

test("a sibling that gives up its layoutId follows the new lead", async ({
    page,
}) => {
    await page.goto("?test=issue-1411-takeover")
    await expect(page.locator("#a")).toBeVisible()
    await page.waitForTimeout(200)
    await page.click("#change")
    // ~10% into a 10s linear animation from B (left: 400) to A (left: 0)
    await page.waitForTimeout(1000)
    const [a, b] = await page.evaluate(() =>
        ["a", "b"].map((id) => {
            const { left, width } = document
                .getElementById(id)!
                .getBoundingClientRect()
            return { left, width }
        })
    )
    // A animates from B's position
    expect(a.left).toBeLessThan(380)
    expect(a.left).toBeGreaterThan(100)
    // B is projected onto A's box rather than left at its own position
    expect(Math.abs(b.left - a.left)).toBeLessThan(2)
    expect(Math.abs(b.width - a.width)).toBeLessThan(2)
})
