import { expect, Page, test } from "@playwright/test"

/**
 * stagger({ grid: "auto" }) reads the grid from the elements' layout.
 */

declare global {
    interface Window {
        Motion: any
        delays: (selector: string) => number[]
        log: string[]
    }
}

async function load(page: Page) {
    await page.goto("animate/animate-stagger-grid-auto.html")
    await page.waitForFunction(() => (window as any).ready)
}

const round = (values: number[]) => values.map((v) => Math.round(v))

test.describe("stagger() grid: auto", () => {
    test.beforeEach(async ({ page }) => load(page))

    test("matches the columns and rows of a CSS grid", async ({ page }) => {
        const { auto, fixed } = await page.evaluate(() => {
            const { animate, stagger } = window.Motion
            animate(
                "#grid .cell",
                { opacity: [0, 1] },
                {
                    duration: 10,
                    delay: stagger(0.1, { grid: "auto", from: "center" }),
                }
            )
            const auto = window.delays("#grid .cell")
            animate(
                "#grid .cell",
                { opacity: [0, 1] },
                {
                    duration: 10,
                    delay: stagger(0.1, { grid: [4, 3], from: "center" }),
                }
            )
            return { auto, fixed: window.delays("#grid .cell") }
        })

        expect(round(auto)).toEqual(round(fixed))
        expect(new Set(round(auto)).size).toBeGreaterThan(2)
    })

    test("keeps wrapped rows of mixed height together", async ({ page }) => {
        const delays = await page.evaluate(() => {
            const { animate, stagger } = window.Motion
            animate(
                "#wrap .cell",
                { opacity: [0, 1] },
                { duration: 10, delay: stagger(0.1, { grid: "auto" }) }
            )
            return window.delays("#wrap .cell")
        })

        // Rows of 3, 3 and 1: element 3 starts row 2, element 6 row 3
        expect(round(delays)).toEqual(
            round([0, 100, 200, 100, 100 * Math.SQRT2, 100 * Math.sqrt(5), 200])
        )
    })

    test("reads all layout before any style write", async ({ page }) => {
        const log = await page.evaluate(async () => {
            const { animate, stagger } = window.Motion

            // Start animations so the next call has some to interrupt
            animate(
                "#grid .cell",
                { opacity: [0, 1], x: [0, 20] },
                { duration: 10 }
            )
            await new Promise((resolve) => requestAnimationFrame(resolve))

            window.log.length = 0
            animate(
                "#grid .cell",
                { opacity: 0.5, x: 0 },
                { duration: 10, delay: stagger(0.1, { grid: "auto" }) }
            )
            return window.log.slice()
        })

        const reads = log.filter((entry) => entry === "read").length
        const firstWrite = log.indexOf("write")

        // Two reads (top, left) per element, all before the first write
        expect(reads).toBe(24)
        expect(firstWrite).toBeGreaterThan(-1)
        expect(log.lastIndexOf("read")).toBeLessThan(firstWrite)
    })
})
