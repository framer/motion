import { expect, Page, test } from "@playwright/test"

/**
 * Issue #2348: `popLayout` position incorrectly calculated.
 *
 * Reporter's repro: AnimatePresence `mode="popLayout"` with `layout` items
 * exiting via `scale: 0.8, opacity: 0`, inside a `ul` with `position: fixed`.
 * In a fixed bottom-right container (a toast list), exiting items drop
 * downwards instead of shrinking towards their own centre.
 *
 * PopChild pins the popped item to its offsetParent's edges, but popping it
 * out of the flow shrinks the `ul`. A bottom-anchored (or centred) `ul` then
 * moves, carrying the popped item with it, and the item's `layout` animation
 * slides it there.
 *
 * A scale exit keeps the box centre fixed, so an exiting item's centre must
 * not move. The clock is mocked so the mid-exit read is deterministic.
 */
interface Centre {
    x: number
    y: number
}

function readCentre(page: Page, id: string): Promise<Centre> {
    return page.evaluate((id) => {
        const box = document.getElementById(id)!.getBoundingClientRect()
        return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
    }, id)
}

async function setup(page: Page, query: string) {
    await page.clock.install({ time: 0 })
    await page.clock.pauseAt(1000)

    await page.goto(`?test=issue-2348&popLayout${query}`)
    await expect(page.locator("#item-0")).toBeVisible()

    for (let i = 1; i <= 3; i++) {
        await page.evaluate(() => document.getElementById("add")!.click())
        await expect(page.locator(`#item-${i}`)).toBeVisible()
    }

    /**
     * Let the spring layout animations from adding items settle.
     */
    await page.clock.runFor(3000)
}

async function exitItem(page: Page, query: string) {
    await setup(page, query)

    const before = await readCentre(page, "item-1")

    await page.evaluate(() => document.getElementById("item-1")!.click())
    await expect(page.locator("#item-1")).toHaveAttribute("data-motion-pop-id")

    /**
     * Early in the spring exit, while the item is still popped out and
     * mid-scale.
     */
    await page.clock.runFor(100)
    const after = await readCentre(page, "item-1")

    return { before, after }
}

for (const [name, query] of [
    ["static container", ""],
    ["fixed, top-anchored container", "&fixed&anchor=top"],
    ["fixed, bottom-anchored container", "&fixed&anchor=bottom"],
    [
        "fixed, bottom-anchored container, anchorY: bottom",
        "&fixed&anchor=bottom&anchorY=bottom",
    ],
    ["fixed, transform-centred container", "&fixed&anchor=center"],
    ["static container, anchorY: bottom", "&anchorY=bottom"],
    /**
     * The list's offsets are in its local, scaled, coordinate space, so a
     * move measured on screen must be scaled into it.
     */
    ["bottom-anchored container in a scale(0.5) ancestor", "&fixed&anchor=bottom&scale"],
]) {
    test(`popLayout exiting item shrinks towards its centre (${name})`, async ({
        page,
    }) => {
        const { before, after } = await exitItem(page, query)

        expect(Math.abs(after.x - before.x)).toBeLessThan(1)
        expect(Math.abs(after.y - before.y)).toBeLessThan(1)
    })
}

/**
 * Toast list: the oldest item exits as a new one arrives, in the same commit.
 * The container's size, and so its position, ends up unchanged, so the
 * exiting item mustn't be offset for the container's state part-way through
 * the commit.
 */
test("popLayout exiting item stays put when an item is added in the same render", async ({
    page,
}) => {
    await setup(page, "&fixed&anchor=bottom")

    const before = await readCentre(page, "item-0")

    await page.evaluate(() => document.getElementById("cycle")!.click())
    await expect(page.locator("#item-0")).toHaveAttribute("data-motion-pop-id")
    await page.clock.runFor(100)
    const after = await readCentre(page, "item-0")

    expect(Math.abs(after.x - before.x)).toBeLessThan(1)
    expect(Math.abs(after.y - before.y)).toBeLessThan(1)
})

/**
 * Removing an item at the bottom of a scrolled page, or scrollable element,
 * shrinks its content, which clamps the scroll position and moves everything
 * in it. The exiting item should move with the content rather than stay put
 * on screen, where the items above it now are.
 */
for (const [name, query] of [
    ["page", "&scroll"],
    ["scrollable element", "&scroller"],
]) {
    test(`popLayout exiting item moves with the content when the ${name}'s scroll position is clamped`, async ({
        page,
    }) => {
        await setup(page, query)

        const readScroll = () =>
            page.evaluate(
                (isElement) =>
                    isElement
                        ? document.getElementById("scroller")!.scrollTop
                        : window.scrollY,
                query === "&scroller"
            )

        await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight)
            const scroller = document.getElementById("scroller")!
            scroller.scrollTop = scroller.scrollHeight
        })

        const readOffset = async () =>
            (await readCentre(page, "item-1")).y -
            (await readCentre(page, "item-0")).y

        const scrollBefore = await readScroll()
        const before = await readOffset()

        await page.evaluate(() => document.getElementById("item-1")!.click())
        await expect(page.locator("#item-1")).toHaveAttribute(
            "data-motion-pop-id"
        )
        await page.clock.runFor(100)

        // The scroll position was clamped...
        expect(await readScroll()).toBeLessThan(scrollBefore - 50)
        // ...and the exiting item kept its place relative to the item above it.
        expect(Math.abs((await readOffset()) - before)).toBeLessThan(1)
    })
}

/**
 * A fixed container doesn't scroll with the page, so the page's scroll
 * position being clamped, here because removing the item also shrinks the
 * page, mustn't be mistaken for the container moving.
 */
test("popLayout exiting item in a fixed container stays put when the page's scroll position is clamped", async ({
    page,
}) => {
    await setup(page, "&fixed&anchor=bottom&scroll&mirror")

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    const scrollBefore = await page.evaluate(() => window.scrollY)
    const before = await readCentre(page, "item-1")

    await page.evaluate(() => document.getElementById("item-1")!.click())
    await expect(page.locator("#item-1")).toHaveAttribute("data-motion-pop-id")
    await page.clock.runFor(100)

    expect(await page.evaluate(() => window.scrollY)).toBeLessThan(
        scrollBefore - 50
    )
    const after = await readCentre(page, "item-1")
    expect(Math.abs(after.x - before.x)).toBeLessThan(1)
    expect(Math.abs(after.y - before.y)).toBeLessThan(1)
})
