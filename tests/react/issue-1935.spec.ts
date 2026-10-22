/**
 * #1935: a shared layoutId animation inside a layoutRoot should animate
 * relative to the layoutRoot, like a plain layout animation does. Here the
 * tab list shifts 150px left in the same render as the underline moves from
 * Tomato to Lettuce, so the underline should slide one tab (0px to 100px)
 * across the list, not fly in from where Tomato was on the page.
 */
import { expect, Page, test } from "@playwright/test"

async function selectLettuce(
    page: Page,
    query: string,
    before = { underline: 350, list: 350 }
) {
    await page.setViewportSize({ width: 1000, height: 660 })
    await page.goto(`?test=issue-1935&${query}`)
    await expect(page.locator(".underline")).toBeVisible()

    expect(
        await page.evaluate(() => ({
            underline: document
                .querySelector(".underline")!
                .getBoundingClientRect().left,
            list: document.querySelector("ul")!.getBoundingClientRect().left,
        }))
    ).toEqual(before)

    await page.click("#lettuce")
    // The underline transition is 1s
    await page.waitForTimeout(1300)

    return page.evaluate(() => {
        window.recording = false
        // Drop frames recorded before React rendered the click
        const first = window.records.findIndex(({ rendered }) => rendered)
        return window.records.slice(first)
    })
}

function expectSlideAcrossList(offsets: number[]) {
    // From Tomato (0px) to Lettuce (100px) within the list
    expect(offsets[0]).toBeLessThan(5)
    for (const offset of offsets) {
        expect(offset).toBeGreaterThanOrEqual(-0.5)
        expect(offset).toBeLessThanOrEqual(100.5)
    }
    for (let i = 1; i < offsets.length; i++) {
        expect(offsets[i]).toBeGreaterThanOrEqual(offsets[i - 1] - 0.5)
    }
    // Mid-animation it's partway, not already at the end
    expect(offsets.some((o) => o > 30 && o < 70)).toBe(true)
    expect(offsets[offsets.length - 1]).toBeCloseTo(100, 0)
}

test("Shared layout animation inside a layoutRoot animates relative to it", async ({
    page,
}) => {
    const records = await selectLettuce(page, "")
    expect(records.length).toBeGreaterThan(20)

    // The list jumps to its new position and the underline only travels
    // one tab within it
    for (const { list } of records) expect(list).toBeCloseTo(200, 0)
    expectSlideAcrossList(
        records.map(({ underlines, list }) => underlines[0] - list)
    )
})

test("Crossfading shared layout animation inside a layoutRoot animates relative to it", async ({
    page,
}) => {
    const records = await selectLettuce(page, "exit=true")
    expect(records.length).toBeGreaterThan(20)
    for (const { list } of records) expect(list).toBeCloseTo(200, 0)

    // Both underlines are mounted while the old one fades out
    const crossfading = records.filter(
        ({ underlines }) => underlines.length === 2
    )
    expect(crossfading.length).toBeGreaterThan(20)

    // The new underline slides across the list, and the old one follows it
    expectSlideAcrossList(
        records.map(
            ({ underlines, list }) => underlines[underlines.length - 1] - list
        )
    )
    for (const { underlines } of crossfading) {
        expect(underlines[0]).toBeCloseTo(underlines[1], 0)
    }
})

test("Shared layout animation without a layoutRoot animates in page space", async ({
    page,
}) => {
    const records = await selectLettuce(page, "layoutRoot=false")
    expect(records.length).toBeGreaterThan(20)

    // Starts where Tomato's underline was on the page (350px) and ends under
    // Lettuce's new position (300px)
    const lefts = records.map(({ underlines }) => underlines[0])
    expect(lefts[0]).toBeGreaterThan(340)
    for (const left of lefts) {
        expect(left).toBeGreaterThanOrEqual(299.5)
        expect(left).toBeLessThanOrEqual(350.5)
    }
    expect(lefts[lefts.length - 1]).toBeCloseTo(300, 0)
})

test("Shared layout animation from outside a layoutRoot starts from its page position", async ({
    page,
}) => {
    // The underline starts in a box left of the list, at 300px
    const records = await selectLettuce(page, "outside=true", {
        underline: 300,
        list: 400,
    })
    expect(records.length).toBeGreaterThan(20)

    // The sidebar moves the list to 250px and Lettuce's underline to 350px.
    // The animation starts where the underline was on the page, not 100px
    // left of the list (150px), where it was relative to the list.
    const lefts = records.map(({ underlines }) => underlines[0])
    expect(lefts[0]).toBeGreaterThan(295)
    for (const left of lefts) {
        expect(left).toBeGreaterThanOrEqual(299.5)
        expect(left).toBeLessThanOrEqual(350.5)
    }
    expect(lefts[lefts.length - 1]).toBeCloseTo(350, 0)
})
