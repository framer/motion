import * as React from "react"
import { renderToString } from "react-dom/server"
import { motion } from "../../"
import { motionValue } from "../../value"
import { AnimatePresence } from "../../components/AnimatePresence"

describe("ssr", () => {
    test("doesn't throw", () => {
        renderToString(
            <motion.div
                initial={{ x: 100 }}
                whileTap={{ opacity: 0 }}
                drag
                style={{ opacity: 1 }}
            />
        )

        expect(true).toBe(true)
    })

    test("correctly renders HTML", () => {
        const y = motionValue(200)
        const div = renderToString(
            <AnimatePresence>
                <motion.div
                    initial={{ x: 100 }}
                    animate={{ x: 50 }}
                    style={{ y }}
                    exit={{ x: 0 }}
                />
            </AnimatePresence>
        )

        expect(div).toBe(
            '<div style="transform:translateX(100px) translateY(200px) translateZ(0)"></div>'
        )
    })

    test("correctly renders custom HTML tag", () => {
        const y = motionValue(200)
        const CustomComponent = motion.custom("element-test")
        const customElement = renderToString(
            <AnimatePresence>
                <CustomComponent
                    initial={{ x: 100 }}
                    animate={{ x: 50 }}
                    style={{ y }}
                    exit={{ x: 0 }}
                />
            </AnimatePresence>
        )

        expect(customElement).toBe(
            '<element-test style="transform:translateX(100px) translateY(200px) translateZ(0)"></element-test>'
        )
    })

    test("correctly renders SVG", () => {
        const cx = motionValue(100)
        const pathLength = motionValue(100)
        const circle = renderToString(
            <motion.circle
                cx={cx}
                initial={{ strokeWidth: 10 }}
                style={{
                    background: "#fff",
                    pathLength,
                    x: 100,
                }}
            />
        )

        expect(circle).toBe(
            '<circle cx="100" style="background:#fff" stroke-width="10"></circle>'
        )
    })

    test("initial correctly overrides style", () => {
        const div = renderToString(
            <motion.div initial={{ x: 100 }} style={{ x: 200 }} />
        )

        expect(div).toBe(
            `<div style="transform:translateX(100px) translateZ(0)"></div>`
        )
    })
})
