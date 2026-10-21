import { expect, Page, test } from "@playwright/test"

/**
 * #2248: a layout change triggered from onDrag (while the pointer is still
 * down) should end the drag and animate the card back into its slot, exactly
 * like the same change triggered from onDragEnd.
 */
const getBox = (page: Page, selector: string) =>
    page.evaluate(
        (s) => document.querySelector(s)!.getBoundingClientRect().toJSON(),
        selector
    )

async function expectBoxToSettle(page: Page, id: number) {
    const slot = await getBox(page, `#slot-${id}`)

    await expect(async () => {
        const box = await getBox(page, `#card-${id}`)
        expect(box.x).toBeCloseTo(slot.x, 0)
        expect(box.y).toBeCloseTo(slot.y, 0)
        expect(box.width).toBeCloseTo(slot.width, 0)
        expect(box.height).toBeCloseTo(slot.height, 0)
    }).toPass({ timeout: 5000 })
}

async function openAndGrab(page: Page, id: number) {
    await page.goto("/?test=issue-2248")
    const card = page.locator(`#card-${id}`)
    await card.click()
    await expect(card).toHaveAttribute("data-selected", "true")

    // Wait for the open layout animation to finish
    let prev = await getBox(page, `#card-${id}`)
    await expect(async () => {
        const box = await getBox(page, `#card-${id}`)
        const isStill = box.y === prev.y && box.width === prev.width
        prev = box
        expect(isStill).toBe(true)
    }).toPass({ timeout: 5000, intervals: [100] })

    const x = prev.x + prev.width / 2
    const y = prev.y + 50
    await page.mouse.move(x, y)
    await page.mouse.down()

    return { x, y }
}

test("card closed from onDragEnd returns to its slot", async ({ page }) => {
    const { x, y } = await openAndGrab(page, 0)
    await page.mouse.move(x, y + 150, { steps: 15 })
    await page.mouse.up()

    await expect(page.locator("#card-0")).toHaveAttribute(
        "data-selected",
        "false"
    )
    await expectBoxToSettle(page, 0)
})

test("card closed from onDrag animates back to its slot while the pointer is down", async ({
    page,
}) => {
    const { x, y } = await openAndGrab(page, 1)
    const card = page.locator("#card-1")

    let i = 0
    while ((await card.getAttribute("data-selected")) === "true") {
        expect(++i).toBeLessThan(30)
        await page.mouse.move(x, y + i * 10)
    }

    /**
     * The card should layout animate from its open size rather than jump
     * straight to its slot's size.
     */
    const slot = await getBox(page, "#slot-1")
    const box = await getBox(page, "#card-1")
    expect(Math.abs(box.width - slot.width)).toBeGreaterThan(40)

    /**
     * Its layout child animates with it, rather than jumping ahead with
     * its new layout as it would if the card were still being dragged.
     */
    const child = await getBox(page, "#child-1")
    expect(Math.abs(child.x - box.x)).toBeLessThan(20)
    expect(Math.abs(child.y - box.y)).toBeLessThan(20)

    // It returns to its slot without the pointer being released...
    await page.mouse.move(x, y + 300, { steps: 5 })
    await expectBoxToSettle(page, 1)

    // ...and stays there once it is.
    await page.mouse.up()
    await expectBoxToSettle(page, 1)
})
