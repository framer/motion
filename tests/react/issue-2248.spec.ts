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

    /**
     * Record the card and its child every frame from the one it closes on,
     * in the page, so assertions don't depend on when Playwright's round
     * trips happen to sample the animation.
     */
    await page.evaluate(() => {
        const frames: [DOMRect, DOMRect][] = ((window as any).closeFrames = [])
        const record = () => {
            const card = document.querySelector("#card-1")!
            if (card.getAttribute("data-selected") === "false") {
                frames.push([
                    card.getBoundingClientRect(),
                    document.querySelector("#child-1")!.getBoundingClientRect(),
                ])
            }
            requestAnimationFrame(record)
        }
        requestAnimationFrame(record)
    })

    let i = 0
    while ((await card.getAttribute("data-selected")) === "true") {
        expect(++i).toBeLessThan(30)
        await page.mouse.move(x, y + i * 10)
    }

    // It returns to its slot without the pointer being released...
    await page.mouse.move(x, y + 300, { steps: 5 })
    await expectBoxToSettle(page, 1)

    const [maxWidth, maxChildOffset] = await page.evaluate(() => {
        const frames: [DOMRect, DOMRect][] = (window as any).closeFrames
        let maxWidth = 0
        let maxOffset = 0
        for (const [card, child] of frames) {
            maxWidth = Math.max(maxWidth, card.width)
            maxOffset = Math.max(
                maxOffset,
                Math.abs(child.x - card.x),
                Math.abs(child.y - card.y)
            )
        }
        return [maxWidth, maxOffset]
    })

    /**
     * The card should layout animate from its open size (640px) rather than
     * jump straight to its slot's (600px), so it starts out at its open size.
     */
    expect(maxWidth).toBeGreaterThan(610)

    /**
     * Its layout child animates with it, rather than jumping ahead with
     * its new layout (320px left and 144px down of the open card) as it would
     * if the card were still being dragged. The child's own layout animation
     * moves it up to ~60px from the card's corner.
     */
    expect(maxChildOffset).toBeLessThan(100)

    // ...and stays there once it is.
    await page.mouse.up()
    await expectBoxToSettle(page, 1)
})
