/**
 * https://github.com/motiondivision/motion/issues/2338
 *
 * The docs' shared layout tabs, inside a LayoutGroup. Hiding the tab bar and
 * showing it again should render the underline in place under the selected
 * tab. It shouldn't animate in from the box the underline had before the tab
 * bar was hidden.
 *
 * The display: none cases failed up to framer-motion 12.0.5: the underline
 * grew out of the viewport's top-left corner, from the 0x0 snapshot taken
 * while hidden. 12.0.6 ("Discard layout projection snapshots if 0x0") fixed
 * it, and removing that guard from updateSnapshot fails them again.
 *
 * The page records every frame with a rAF loop, so these are the frames the
 * browser painted, not samples taken by the test.
 */
import { expect, Page, test } from "@playwright/test"

interface Box {
    x: number
    y: number
    width: number
}

async function hideAndShow(page: Page, query: string, tab?: string) {
    await page.goto(`?test=issue-2338${query}`)
    await expect(page.locator("#underline")).toBeVisible()
    await page.waitForTimeout(200)

    if (tab) {
        await page.click(`#${tab}`)
        // Let the underline's layout animation finish
        await page.waitForTimeout(1000)
    }

    await page.click("#toggle")
    await expect(page.locator("#underline")).toBeHidden()
    await page.waitForTimeout(300)
    await page.click("#toggle")
    await expect(page.locator("#underline")).toBeVisible()
    await page.waitForTimeout(300)

    return page.evaluate(() => {
        const w = window as any
        const { x, y, width } = document
            .getElementById("underline")!
            .getBoundingClientRect()
        return {
            frames: (w.frames as Array<Box | null>)
                .slice(w.shownAt)
                .filter(Boolean) as Box[],
            final: { x, y, width },
        }
    })
}

const near = (a: Box, b: Box) =>
    Math.abs(a.x - b.x) < 1 &&
    Math.abs(a.y - b.y) < 1 &&
    Math.abs(a.width - b.width) < 1

for (const [name, query, tab] of [
    ["", "", undefined],
    [" after changing tab", "", "Cheese"],
    [" that moved while hidden", "&move=true", undefined],
    [" that moved while hidden, after changing tab", "&move=true", "Lettuce"],
    [" when hidden with display: none", "&display=true", undefined],
    [
        " when hidden with display: none, after changing tab",
        "&display=true",
        "Cheese",
    ],
] as const) {
    test(`re-showing tabs doesn't animate the underline${name}`, async ({
        page,
    }) => {
        const { frames, final } = await hideAndShow(page, query, tab)

        expect(frames.length).toBeGreaterThan(5)
        expect(frames.filter((box) => !near(box, final))).toEqual([])
    })
}
