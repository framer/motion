import { expect, Page, test } from "@playwright/test"

/**
 * #2514 (and #1972): a `layoutId` indicator is mispositioned when content
 * that comes before it in the tree changes height in the same render.
 *
 * The previous indicator's snapshot was taken when it unmounted, during
 * React's mutation phase, after React had already applied the height change
 * to the earlier sibling. So the animation started from a position the
 * indicator never occupied on screen.
 *
 * Every mid-animation value is a single-point `page.evaluate` read, so a
 * retrying assertion can't wait the animation out and hide a wrong origin.
 */

const DURATION = 4

interface Rect {
    x: number
    y: number
    width: number
    height: number
}

interface Sample {
    indicator: Rect
    nav: Rect
}

function expectNear(actual: number, expected: number, tolerance: number) {
    expect(
        Math.abs(actual - expected),
        `${actual} should be within ${tolerance} of ${expected}`
    ).toBeLessThanOrEqual(tolerance)
}

const sample = (page: Page): Promise<Sample> =>
    page.evaluate(() => {
        const rect = (id: string) => {
            const { x, y, width, height } = document
                .getElementById(id)!
                .getBoundingClientRect()
            return { x, y, width, height }
        }
        return { indicator: rect("indicator"), nav: rect("nav") }
    })

/**
 * Select the third item and sample half way through the linear animation,
 * then once it's at rest.
 */
async function run(page: Page, query: string) {
    await page.goto(`?test=issue-2514&duration=${DURATION}${query}`)
    await expect(page.locator("#indicator")).toBeVisible()

    const start = await sample(page)

    await page.click("#item-c")
    await page.waitForTimeout((DURATION * 1000) / 2)
    const mid = await sample(page)

    await page.waitForTimeout(DURATION * 1000 + 300)
    const end = await sample(page)
    const target = await page.evaluate(() => {
        const { x, y, width, height } = document
            .getElementById("item-c")!
            .getBoundingClientRect()
        return { x, y, width, height }
    })

    return { start, mid, end, target }
}

const halfway = (a: number, b: number) => (a + b) / 2

for (const [name, query] of [
    ["column", "&vertical=1&mode=below"],
    ["row", "&vertical=0&mode=below"],
    ["column, fill indicator", "&vertical=1&mode=below&indicator=full"],
    ["column, nav before content", "&vertical=1&mode=flow"],
    ["row, nav before content", "&vertical=0&mode=flow"],
] as const) {
    test(`#2514: indicator animates from where it was on screen (${name})`, async ({
        page,
    }) => {
        const { start, mid, end, target } = await run(page, query)

        expectNear(
            mid.indicator.y,
            halfway(start.indicator.y, end.indicator.y),
            20
        )
        expectNear(
            mid.indicator.x,
            halfway(start.indicator.x, end.indicator.x),
            20
        )

        // Comes to rest on the selected item.
        expectNear(end.indicator.x, target.x, 1)
        expectNear(end.indicator.width, target.width, 1)
        expectNear(
            end.indicator.y + end.indicator.height,
            target.y + target.height,
            1
        )
    })
}

/**
 * The fix for the "indicator floats away from the nav" complaint is to make
 * the nav a `layout` component too. The indicator must then stay attached to
 * the nav as the nav animates its own displacement.
 */
for (const [name, query] of [
    ["column", "&vertical=1&mode=below&navLayout=1"],
    ["row", "&vertical=0&mode=below&navLayout=1"],
] as const) {
    test(`#2514: indicator stays attached to a layout-animating nav (${name})`, async ({
        page,
    }) => {
        const { start, mid, end } = await run(page, query)

        // The nav is half way through its own animation...
        expectNear(mid.nav.y, halfway(start.nav.y, end.nav.y), 20)

        // ...and the indicator is half way between its offsets within the nav.
        const offset = (s: Sample) => s.indicator.y - s.nav.y
        expectNear(offset(mid), halfway(offset(start), offset(end)), 20)
        expectNear(
            mid.indicator.x,
            halfway(start.indicator.x, end.indicator.x),
            20
        )
    })
}

/**
 * `layout="x"` (PR #3627) still opts out of animating the y displacement.
 */
test(`#2514: layout="x" still snaps the y axis`, async ({ page }) => {
    const { start, mid, end } = await run(
        page,
        "&vertical=0&mode=below&axis=x"
    )

    expectNear(mid.indicator.y, end.indicator.y, 1)
    expectNear(mid.indicator.x, halfway(start.indicator.x, end.indicator.x), 20)
})
