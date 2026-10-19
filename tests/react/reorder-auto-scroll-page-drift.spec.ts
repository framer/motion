/**
 * #3944: on a page-scrolling Reorder.Group, a pointermove handled after the
 * window scrolled but before its scroll event already includes that scroll
 * in pageY, and PanSession used to add it again. Auto-scroll then read a
 * point below the real pointer and scrolled faster than the pointer
 * position allows, which fed back into itself.
 */
import { expect, test } from "@playwright/test"
import { frames } from "../gestures/drag-helpers"

/**
 * The expected auto-scroll per call for a pointer `distance` px from the
 * edge: maxSpeed * (1 - distance / threshold)^2.
 */
const expectedAmount = (distance: number) => 25 * (1 - distance / 50) ** 2

test("auto-scroll tracks the real pointer on a page-scrolling Reorder.Group", async ({
    page,
}) => {
    await page.goto("?test=reorder-auto-scroll-page-drift")
    await expect(page.locator("#item-3")).toBeVisible()
    await frames(page, 2)

    const { innerHeight, itemTop } = await page.evaluate(() => ({
        innerHeight: window.innerHeight,
        itemTop: document.getElementById("item-3")!.getBoundingClientRect().top,
    }))

    // Grab Item 3 25px below its top and drag it to 2px above the bottom
    // edge of the viewport.
    const x = 150
    const grabOffset = 25
    const edgeY = innerHeight - 2
    await page.mouse.move(x, itemTop + grabOffset)
    await page.mouse.down()
    await frames(page, 1)
    await page.mouse.move(x, itemTop + grabOffset + 10)
    await frames(page, 1)
    await page.mouse.move(x, edgeY, { steps: 20 })

    // Hold, then wiggle slightly, staying at the edge
    for (let i = 0; i < 30; i++) {
        await frames(page, 1)
        await page.mouse.move(x + (i % 2 ? 1 : -1), edgeY)
    }
    await frames(page, 2)

    const { calls, scrollY, offset } = await page.evaluate(
        (grabOffset) => ({
            calls: (window as any).scrollCalls as number[],
            scrollY: window.scrollY,
            // Where the pointer sits within the dragged item
            offset:
                window.innerHeight -
                2 -
                document.getElementById("item-3")!.getBoundingClientRect().top -
                grabOffset,
        }),
        grabOffset
    )

    await page.mouse.up()

    // Auto-scroll ran and moved the page
    expect(calls.length).toBeGreaterThan(5)
    expect(scrollY).toBeGreaterThan(0)

    // The pointer never left the viewport, so no single call may exceed
    // what its distance from the edge allows. The closest it gets is 2px.
    const max = Math.max(...calls)
    expect(max).toBeLessThanOrEqual(expectedAmount(2) + 0.1)

    // The dragged item stays under the pointer. A window scroll is only
    // compensated when its scroll event fires, a frame later, so while
    // auto-scroll runs the item can trail by up to one scroll step.
    expect(Math.abs(offset)).toBeLessThan(50)
})
