import { expect, test } from "@playwright/test"

/**
 * #3769: a useTransform value should follow a source MotionValue that's set
 * while an <Activity> hides it (source 10, derived 20 once revealed).
 * Revealing re-runs the effects without a render, so without the fix the
 * derived value stays at 0.
 */
test("useTransform follows a value set while hidden by <Activity>", async ({
    page,
}) => {
    await page.goto("?test=issue-3769-activity")
    await page.locator("#probe, #unsupported").first().waitFor({
        state: "attached",
    })
    test.skip(
        (await page.locator("#unsupported").count()) > 0,
        "<Activity> is not supported"
    )

    const el = page.locator("#probe")
    await expect(el).toHaveText("0")

    await page.click("#hide")
    await expect(el).toBeHidden()

    const renders = await page.evaluate(() => {
        const { probe, probeRenders } = window as any
        probe.x.set(10)
        return probeRenders
    })

    await page.click("#show")
    await expect(el).toBeVisible()

    await expect
        .poll(() =>
            page.evaluate(() => {
                const { x, doubled } = (window as any).probe
                return [x.get(), doubled.get()]
            })
        )
        .toEqual([10, 20])
    await expect(el).toHaveText("20")

    // The reveal re-ran Probe's effects without re-rendering it.
    expect(await page.evaluate(() => (window as any).probeRenders)).toBe(
        renders
    )
})
