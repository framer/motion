import { expect, test } from "@playwright/test"

/**
 * #2662: a menu that AnimatePresence mounts must slide down and stagger its
 * links in under StrictMode. framer-motion <= 11.2.10 left it on `initial`
 * with React 19's StrictMode (fixed in 11.2.11), which is how Next.js dev
 * with experimental.taint broke it. The page records every frame after the
 * click, so a menu that jumps or never moves fails.
 */
test("menu mounted by AnimatePresence animates in under StrictMode", async ({
    page,
}) => {
    await page.goto("?test=issue-2662")
    await page.click("#toggle")

    await expect
        .poll(() => page.evaluate(() => (window as any).frames2662.length), {
            timeout: 10000,
        })
        .toBe(120)

    const frames: Array<[number, string]> = await page.evaluate(
        () => (window as any).frames2662
    )
    const innerHeight = await page.evaluate(() => window.innerHeight)

    // The menu slid through intermediate positions...
    expect(frames.some(([y]) => y < -1 && y > -innerHeight + 1)).toBe(true)
    // ...and finished open, with the staggered links shown
    expect(frames[frames.length - 1]).toEqual([0, "1"])
})
