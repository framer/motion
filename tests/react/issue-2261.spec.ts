import { expect, test } from "@playwright/test"
import { createServer } from "http"
import { AddressInfo } from "net"

/**
 * #2261: Electron's `webSecurity: false` maps to Chromium's
 * --disable-web-security. Animations were reported to start ~400ms late
 * and run slowly with it. Launch Chromium with that flag and check the
 * reporter's animations start on the next frames and finish on time.
 */
type Frame = [number, string, string | null]

const xOf = (transform: string) =>
    transform === "none" ? 0 : Number(transform.split(",")[4])

for (const clickDelay of [0, 1000]) {
    test(`animations run on time with --disable-web-security (click after ${clickDelay}ms)`, async ({
        playwright,
        launchOptions,
        baseURL,
    }) => {
        const browser = await playwright.chromium.launch({
            ...launchOptions,
            args: [...(launchOptions.args ?? []), "--disable-web-security"],
        })
        try {
            const page = await browser.newPage({ baseURL })
            await page.goto("/?test=issue-2261")

            // Web security is really off: a cross-origin response without
            // CORS headers can be read.
            const server = createServer((_, res) => res.end("ok"))
            await new Promise<void>((resolve) => server.listen(0, resolve))
            const { port } = server.address() as AddressInfo
            const crossOrigin = await page.evaluate(
                (url) =>
                    fetch(url).then(
                        (r) => r.text(),
                        () => "blocked"
                    ),
                `http://localhost:${port}/`
            )
            server.close()
            expect(crossOrigin).toBe("ok")

            await page.locator("#toggle").waitFor()
            if (clickDelay) await page.waitForTimeout(clickDelay)
            await page.locator("#toggle").click()
            await page.waitForTimeout(1500)

            const frames: Frame[] = await page.evaluate(
                () =>
                    (window as unknown as { recording: { frames: Frame[] } })
                        .recording.frames
            )
            const opacityFrames = frames.filter(([, , o]) => o !== null)
            const opacityStart = opacityFrames.find(([, , o]) => +o! > 0.01)
            const opacityEnd = opacityFrames.find(([, , o]) => +o! >= 0.999)
            const xHalfway = frames.find(([, t]) => xOf(t) >= 50)

            // Starts within a few frames of the click, not ~400ms later
            expect(opacityStart).toBeDefined()
            expect(opacityStart![0]).toBeLessThan(200)
            expect(xHalfway).toBeDefined()
            expect(xHalfway![0]).toBeLessThan(300)

            // The default 0.3s tween finishes on time rather than slowly
            expect(opacityEnd).toBeDefined()
            expect(opacityEnd![0]).toBeLessThan(700)

            // The frame loop keeps ticking at display rate
            const times = frames.map(([t]) => t)
            const gaps = times.slice(1).map((t, i) => t - times[i])
            const meanGap = gaps.reduce((a, b) => a + b, 0) / gaps.length
            expect(meanGap).toBeLessThan(25)
        } finally {
            await browser.close()
        }
    })
}
