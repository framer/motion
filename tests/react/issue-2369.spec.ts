/**
 * #2369: with backgroundColor animating to CSS variables and scale animating
 * with a spring, pressing the button while the hover's scale spring was
 * still running made the background jump back to the hover colour once that
 * spring finished, and stay there for the rest of the press.
 */
import { expect, test } from "@playwright/test"
import { frames } from "../gestures/drag-helpers"

const green = "rgb(0, 255, 0)"

test("background keeps the tap colour after the hover's scale spring ends", async ({
    page,
}) => {
    await page.goto("?test=issue-2369")
    const box = page.locator("#box")
    await expect(box).toBeVisible()
    const { x, y, width, height } = (await box.boundingBox())!

    // Hover starts the scale spring and animates the background to --blue
    await page.mouse.move(x + width / 2, y + height / 2)
    await frames(page, 2)

    // Press while that spring is still running
    expect(
        await page.evaluate(() => (window as any).scaleAnimationComplete)
    ).toBeFalsy()

    await page.evaluate(() => {
        const el = document.getElementById("box")!
        const log: string[] = []
        ;(window as any).backgroundLog = log
        const sample = () => {
            log.push(getComputedStyle(el).backgroundColor)
            requestAnimationFrame(sample)
        }
        requestAnimationFrame(sample)
    })
    await page.mouse.down()

    // Wait for the hover's scale spring to finish, then a few more frames
    await page.waitForFunction(() => (window as any).scaleAnimationComplete)
    await frames(page, 5)

    const log: string[] = await page.evaluate(
        () => (window as any).backgroundLog
    )
    const firstGreen = log.indexOf(green)
    expect(firstGreen).toBeGreaterThan(-1)

    // Once the tap colour is reached, it holds for the rest of the press
    expect(log.slice(firstGreen).filter((c) => c !== green)).toEqual([])
    await expect(box).toHaveCSS("background-color", green)

    await page.mouse.up()
})
