/**
 * https://github.com/motiondivision/motion/issues/2024
 *
 * Scroll a scrollable Reorder.Group, then drag a Reorder.Item that has
 * dragConstraints set. The item should follow the pointer (moved by the
 * pointer delta) and must not jump by the group's scroll offset.
 *
 * Motion only measures the scroll of containers marked `layoutScroll`, so the
 * scrolled cases mark the group with it. On main, ref constraints there were
 * measured before the scroll (and against the layoutBox, which removes that
 * scroll), so the item moved ~65px UP for a 20px pointer drag. scrollTop=0,
 * object constraints and no constraints behave correctly and act as controls.
 */
import { expect, Page, test } from "@playwright/test"

const scrollTo = async (page: Page, id: string, scroll: number) => {
    await page.evaluate(
        ([id, scroll]) => {
            document.getElementById(id as string)!.scrollTop = scroll as number
        },
        [id, scroll]
    )
    await page.waitForTimeout(200)
}

const drag = async (page: Page, index: number, distance: number) => {
    const item = page.locator(`#item-${index}`)
    const before = (await item.boundingBox())!
    const x = before.x + 50
    const y = before.y + 30
    await page.mouse.move(x, y)
    await page.mouse.down()
    // Small drag down, staying within the group's visible bounds
    await page.mouse.move(x, y + 5, { steps: 2 })
    await page.mouse.move(x, y + distance, { steps: 10 })
    await page.waitForTimeout(100)
    // Single-point read while dragging
    const measure = async () => (await item.boundingBox())!.y - before.y
    const dy = await measure()
    return {
        dy,
        // Then drag the same distance up from the start
        up: async () => {
            await page.mouse.move(x, y - distance, { steps: 10 })
            await page.waitForTimeout(100)
            return measure()
        },
        release: () => page.mouse.up(),
    }
}

// [query, group scrollTop, outer scrollTop, item index] - the item is always
// ~140-150px from the top of the group's visible area so a 20px drag stays
// in bounds.
for (const [query, scroll, outerScroll, index] of [
    ["constraints=ref", 0, 0, 2],
    ["constraints=none", 200, 0, 5],
    ["constraints=object", 200, 0, 5],
    ["constraints=ref&layoutScroll", 200, 0, 5],
    // A layoutScroll container around the constraints moves both together
    ["constraints=ref&layoutScroll&outer", 200, 150, 5],
] as const) {
    test(`issue #2024: ${query} scrollTop=${scroll} outer=${outerScroll} - dragged item follows the pointer`, async ({
        page,
    }) => {
        await page.goto(`?test=issue-2024&${query}`)
        await expect(page.locator(`#item-${index}`)).toBeVisible()
        await page.waitForTimeout(200)

        if (outerScroll) await scrollTo(page, "outer", outerScroll)
        await scrollTo(page, "group", scroll)

        const { dy, up, release } = await drag(page, index, 20)
        const dyUp = await up()
        await release()

        if (query === "constraints=object") {
            // { top: 0, bottom: 0 } with default elastic 0.5: item moves
            // less than the pointer but in the same direction, never by
            // the scroll offset.
            expect(dy).toBeGreaterThanOrEqual(0)
            expect(dy).toBeLessThanOrEqual(20)
            expect(dyUp).toBeLessThanOrEqual(0)
            expect(dyUp).toBeGreaterThanOrEqual(-20)
        } else {
            // Item follows the pointer, down and then up
            expect(Math.abs(dy - 20)).toBeLessThanOrEqual(2)
            expect(Math.abs(dyUp + 20)).toBeLessThanOrEqual(2)
        }
    })
}

/**
 * After a reorder the item's layout is re-measured with the group scrolled.
 * Scrolling further and dragging again must still follow the pointer.
 */
test("issue #2024: ref constraints&layoutScroll - drag again after reordering in a scrolled group", async ({
    page,
}) => {
    await page.goto(`?test=issue-2024&constraints=ref&layoutScroll`)
    const group = page.locator("#group")
    await expect(page.locator("#item-5")).toBeVisible()
    await page.waitForTimeout(200)

    await scrollTo(page, "group", 200)

    // Drag item 5 below item 6 and drop it, reordering the list
    const first = await drag(page, 5, 75)
    await first.release()
    await page.waitForTimeout(1000)
    expect(
        await group.evaluate((el) =>
            Array.from(el.children, (child) => child.id).slice(5, 7)
        )
    ).toEqual(["item-6", "item-5"])

    await scrollTo(page, "group", 250)

    const second = await drag(page, 5, 20)
    await second.release()
    expect(Math.abs(second.dy - 20)).toBeLessThanOrEqual(2)
})
