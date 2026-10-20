import { expect, Page, test } from "@playwright/test"

/**
 * #3942: a motion component first mounted inside a hidden <Activity> should
 * animate to its latest `animate` value when revealed. Without the fix it
 * animates to the value from its first render, so opacity stays at 0.
 */
const ids = ["rerender", "memo"]

async function load(page: Page) {
    await page.goto("?test=issue-3942-activity")
    await page.locator("#toggle-shown, #unsupported").first().waitFor({
        state: "attached",
    })
    test.skip(
        (await page.locator("#unsupported").count()) > 0,
        "<Activity> is not supported"
    )
}

async function expectOpacity(page: Page, opacity: string) {
    for (const id of ids) {
        const el = page.locator(`#${id}`)
        await expect(el).toBeVisible()
        await expect(el).toHaveCSS("opacity", opacity)
    }
}

test("animate changed before an <Activity> is first revealed is used on reveal", async ({
    page,
}) => {
    await load(page)

    // Mounted hidden, then animate changes while still hidden.
    await page.click("#toggle-active")
    await page.click("#toggle-shown")
    await expectOpacity(page, "1")

    // Still follows animate once visible.
    await page.click("#toggle-active")
    await expectOpacity(page, "0")
})

test("animate changed while an <Activity> is re-hidden is used on reveal", async ({
    page,
}) => {
    await load(page)

    await page.click("#toggle-shown")
    await expectOpacity(page, "0")

    await page.click("#toggle-shown")
    await page.click("#toggle-active")
    await page.click("#toggle-shown")
    await expectOpacity(page, "1")
})
