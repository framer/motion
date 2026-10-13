import { expect, test } from "@playwright/test"

/**
 * #3769: a useTransform value derived from a MotionValue that is set in an
 * effect should follow it (source 10, derived 20). Without the fix the
 * derived value's update is lost and it stays at 0.
 */
for (const id of ["effect", "child-layout-effect"]) {
    test(`useTransform follows a value set in a ${id} under Strict Mode`, async ({
        page,
    }) => {
        await page.goto("?test=issue-3769")
        const el = page.locator(`#${id}`)
        await expect(el).toBeVisible()

        await expect
            .poll(() =>
                page.evaluate((id) => {
                    const { x, doubled } = (window as any)[id]
                    return [x.get(), doubled.get()]
                }, id)
            )
            .toEqual([10, 20])
        await expect(el).toHaveText("20")
    })
}
