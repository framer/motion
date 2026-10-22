/**
 * https://github.com/motiondivision/motion/issues/2094
 *
 * The main `Reorder` renders `motion` components, so within <LazyMotion strict>
 * it warned "Import and render a `m` component instead" for the Group and
 * every Item, on every render, and users had no way to act on it. It should
 * warn once and point to the `Reorder` that works with LazyMotion.
 *
 * motion-utils only enables warning()/invariant() when a `process` global
 * exists (as under webpack/Next.js, the reporter's setup). Vite doesn't define
 * one, so it's injected before page scripts run.
 */
import { expect, Page, test } from "@playwright/test"

const order = (page: Page) =>
    page.locator("li").evaluateAll((items) => items.map((item) => item.id))

for (const features of ["sync", "async"]) {
    test(`Reorder inside LazyMotion strict (${features} features) warns once, with a fix`, async ({
        page,
    }) => {
        await page.addInitScript(() => {
            ;(window as any).process = { env: { NODE_ENV: "development" } }
        })
        const messages: string[] = []
        page.on("console", (msg) => messages.push(msg.text()))
        page.on("pageerror", (error) => messages.push(error.message))

        await page.goto(`?test=issue-2094&features=${features}`)
        await expect(page.locator("#item-2")).toBeVisible()
        await page.waitForTimeout(200)

        // Drag the first item past the second, re-rendering every item
        const { x, y } = (await page.locator("#item-0").boundingBox())!
        await page.mouse.move(x + 10, y + 10)
        await page.mouse.down()
        for (let i = 1; i <= 8; i++) {
            await page.mouse.move(x + 10, y + 10 + i * 10)
            await page.waitForTimeout(20)
        }
        await page.mouse.up()
        await page.waitForTimeout(300)
        expect(await order(page)).toEqual(["item-1", "item-0", "item-2"])

        const strictWarnings = messages.filter((text) =>
            text.includes("within a `LazyMotion` component")
        )
        expect(strictWarnings).toHaveLength(1)
        expect(strictWarnings[0]).toContain(
            'For Reorder, import it from "motion/react-m"'
        )
    })
}
