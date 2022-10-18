import * as React from "react"
import { renderToString, renderToStaticMarkup } from "react-dom/server"
import { motion } from "../../../render/dom/motion"
import { Timeline } from "../index"
import { TimelineSequence } from "../types"

function runTests(render: (components: any) => string) {
    test("renders children", () => {
        const sequence: TimelineSequence = []

        const html = render(
            <Timeline animate={sequence}>
                <motion.div />
            </Timeline>
        )

        expect(html).toBe(`<div></div>`)
    })

    test("doesn't render initial values if implied to be null", () => {
        const sequence: TimelineSequence = [["box", { opacity: 0 }]]

        const html = render(
            <Timeline animate={sequence}>
                <motion.div track="box" />
            </Timeline>
        )

        expect(html).toBe(`<div></div>`)
    })

    test("doesn't render initial values if explicitly null", () => {
        const sequence: TimelineSequence = [["box", { opacity: [null, 0] }]]

        const html = render(
            <Timeline animate={sequence}>
                <motion.div track="box" />
            </Timeline>
        )

        expect(html).toBe(`<div></div>`)
    })

    test("renders initial values if explicitly set", () => {
        const sequence: TimelineSequence = [["box", { opacity: [0.5, 0] }]]

        const html = render(
            <Timeline animate={sequence}>
                <motion.div track="box" />
            </Timeline>
        )

        expect(html).toBe(`<div style="opacity:0.5"></div>`)
    })

    test("renders final values if initial=false", () => {
        const sequence: TimelineSequence = [["box", { opacity: [0.5, 0.1] }]]

        const html = render(
            <Timeline initial={false} animate={sequence}>
                <motion.div track="box" />
            </Timeline>
        )

        expect(html).toBe(`<div style="opacity:0.1"></div>`)
    })

    test("renders component initial values instead of timeline values", () => {
        const sequence: TimelineSequence = [["box", { opacity: [0.5, 0] }]]

        const html = render(
            <Timeline animate={sequence}>
                <motion.div track="box" initial={{ opacity: 0.2 }} />
            </Timeline>
        )

        expect(html).toBe(`<div style="opacity:0.2"></div>`)
    })

    test("renders component animate values instead of timeline values if initial=false", () => {
        const sequence: TimelineSequence = [["box", { opacity: [0.5, 0] }]]

        const html = render(
            <Timeline animate={sequence}>
                <motion.div
                    track="box"
                    initial={false}
                    animate={{ opacity: 0.2 }}
                />
            </Timeline>
        )

        expect(html).toBe(`<div style="opacity:0.2"></div>`)
    })
}

describe("Timeline: render", () => {
    runTests(renderToString)
})

describe("Timeline: renderToStaticMarkup", () => {
    runTests(renderToStaticMarkup)
})
