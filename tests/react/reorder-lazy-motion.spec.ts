/**
 * https://github.com/motiondivision/motion/issues/2232
 *
 * Reorder from the `m` entry renders `m` components, so it gets drag and
 * layout from LazyMotion instead of bundling them. Inside a strict LazyMotion
 * it reorders, doesn't log the strict-mode warning, and with async features
 * is inert until they load.
 *
 * motion-utils only enables warning()/invariant() when a `process` global
 * exists. Vite doesn't define one, so it's injected before page scripts run.
 */
import { expect, Page, test } from "@playwright/test"

const order = (page: Page) =>
    page.locator("li").evaluateAll((items) => items.map((item) => item.id))

async function dragFirstDown(page: Page) {
    const { x, y } = (await page.locator("#a").boundingBox())!
    await page.mouse.move(x + 10, y + 10)
    await page.mouse.down()
    for (let i = 1; i <= 8; i++) {
        await page.mouse.move(x + 10, y + 10 + i * 10)
        await page.waitForTimeout(20)
    }
    await page.mouse.up()
    await page.waitForTimeout(300)
}

for (const features of ["sync", "async"]) {
    test(`Reorder (m) reorders inside LazyMotion strict (${features} features)`, async ({
        page,
    }) => {
        await page.addInitScript(() => {
            ;(window as any).process = { env: { NODE_ENV: "development" } }
        })
        const messages: string[] = []
        page.on("console", (msg) => messages.push(msg.text()))
        page.on("pageerror", (error) => messages.push(error.message))

        await page.goto(`?test=reorder-lazy-motion&features=${features}`)
        await expect(page.locator("#c")).toBeVisible()

        if (features === "async") {
            await dragFirstDown(page)
            expect(await order(page)).toEqual(["a", "b", "c"])

            await page.evaluate(() => (window as any).loadFeatures())
            await page.waitForTimeout(100)
        }

        await dragFirstDown(page)
        expect(await order(page)).toEqual(["b", "a", "c"])

        const strictWarnings = messages.filter((text) =>
            text.includes("LazyMotion")
        )
        expect(strictWarnings).toEqual([])
    })
}
