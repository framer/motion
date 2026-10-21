import { expect, Page, test } from "@playwright/test"

/**
 * #2338: hiding the docs' shared layout tabs and showing them again made the
 * `layoutId="underline"` animate in from the top-left of the viewport.
 *
 * With `display: none`, the underline measures as a zero box while hidden.
 * That zero box was kept as the snapshot for the render that shows it again,
 * so it animated from (0, 0) at scale 0 to where it already was.
 *
 * Every value is a single-point `page.evaluate` read, so a retrying
 * assertion can't wait the animation out.
 */

const DURATION = 4

interface Rect {
    x: number
    y: number
    width: number
    height: number
}

const rect = (page: Page): Promise<Rect> =>
    page.evaluate(() => {
        const { x, y, width, height } = document
            .getElementById("underline")!
            .getBoundingClientRect()
        return { x, y, width, height }
    })

function expectSameRect(actual: Rect, expected: Rect) {
    for (const key of ["x", "y", "width", "height"] as const) {
        expect(
            Math.abs(actual[key] - expected[key]),
            `${key}: ${actual[key]} should be ${expected[key]}`
        ).toBeLessThanOrEqual(1)
    }
}

/**
 * `unmount` resets the selected tab, so it's only checked from the first tab.
 */
for (const [hide, tab] of [
    ["display", "Tomato"],
    ["display", "Lettuce"],
    ["unmount", "Tomato"],
]) {
    test(`#2338: underline doesn't animate when tabs are shown again (${hide}, ${tab})`, async ({
        page,
    }) => {
        await page.goto(`?test=issue-2338&hide=${hide}&duration=${DURATION}`)
        await expect(page.locator("#underline")).toBeVisible()

        if (tab !== "Tomato") {
            await page.click(`#tab-${tab}`)
            await page.waitForTimeout(DURATION * 1000 + 300)
        }

        const before = await rect(page)

        await page.click("#toggle")
        await page.waitForTimeout(300)
        await page.click("#toggle")

        await page.waitForTimeout(100)
        expectSameRect(await rect(page), before)

        await page.waitForTimeout((DURATION * 1000) / 2)
        expectSameRect(await rect(page), before)
    })
}
