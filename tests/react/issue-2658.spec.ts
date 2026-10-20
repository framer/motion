import { expect, Page, test } from "@playwright/test"

/**
 * #2658: Reorder.Group's `keyboard` prop lets arrow keys move the focused
 * Reorder.Item. Focus has to survive React moving the node, which only a
 * real browser checks: JSDOM doesn't blur an element when it's moved.
 */
const order = (page: Page) => page.locator("#order").textContent()
const focused = (page: Page) =>
    page.evaluate(() => document.activeElement?.id)

test.describe("Issue #2658: keyboard reordering", () => {
    test("Tab reaches items and arrows move the focused one", async ({
        page,
    }) => {
        await page.goto("?test=issue-2658")
        await page.focus("#before")
        await page.keyboard.press("Tab")
        expect(await focused(page)).toBe("a")

        await page.keyboard.press("ArrowDown")
        expect(await order(page)).toBe("b,a,c,d")
        expect(await focused(page)).toBe("a")

        await page.keyboard.press("ArrowDown")
        await page.keyboard.press("ArrowDown")
        expect(await order(page)).toBe("b,c,d,a")
        expect(await focused(page)).toBe("a")

        // Past the end
        await page.keyboard.press("ArrowDown")
        expect(await order(page)).toBe("b,c,d,a")

        await page.keyboard.press("ArrowUp")
        expect(await order(page)).toBe("b,c,a,d")
        expect(await focused(page)).toBe("a")

        // Across the axis
        await page.keyboard.press("ArrowRight")
        expect(await order(page)).toBe("b,c,a,d")
    })

    test("focus survives a held key", async ({ page }) => {
        await page.goto("?test=issue-2658")
        await page.focus("#d")
        for (let i = 0; i < 3; i++) {
            await page.keyboard.down("ArrowUp")
        }
        await page.keyboard.up("ArrowUp")
        expect(await order(page)).toBe("d,a,b,c")
        expect(await focused(page)).toBe("d")
    })

    test("moving an item up keeps focus", async ({ page }) => {
        // React moves a different node depending on direction
        await page.goto("?test=issue-2658")
        await page.focus("#c")
        await page.keyboard.press("ArrowUp")
        expect(await order(page)).toBe("a,c,b,d")
        expect(await focused(page)).toBe("c")
    })

    test("keys inside an item don't reorder", async ({ page }) => {
        await page.goto("?test=issue-2658")
        await page.focus("#a-input")
        await page.keyboard.press("ArrowDown")
        await page.keyboard.press("ArrowRight")
        expect(await order(page)).toBe("a,b,c,d")
    })

    test("x axis and RTL", async ({ page }) => {
        await page.goto("?test=issue-2658&axis=x")
        await page.focus("#a")
        await page.keyboard.press("ArrowRight")
        expect(await order(page)).toBe("b,a,c,d")
        expect(await focused(page)).toBe("a")

        await page.goto("?test=issue-2658&axis=x&rtl")
        await page.focus("#a")
        await page.keyboard.press("ArrowLeft")
        expect(await order(page)).toBe("b,a,c,d")
        expect(await focused(page)).toBe("a")
    })

    test("the reorder layout-animates", async ({ page }) => {
        await page.goto("?test=issue-2658&layout")
        await page.focus("#a")
        const before = await page.locator("#a").boundingBox()
        await page.keyboard.press("ArrowDown")
        await page.waitForTimeout(500)
        const mid = await page.locator("#a").boundingBox()
        // 50px per slot (40px + 10px gap); halfway through a 1s linear move
        expect(mid!.y - before!.y).toBeGreaterThan(10)
        expect(mid!.y - before!.y).toBeLessThan(40)
        expect(await focused(page)).toBe("a")
    })
})
