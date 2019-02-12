import * as React from "react"
import { renderToString } from "react-dom/server"
import { motion } from "../"

describe("ssr", () => {
    test("doesn't throw", () => {
        renderToString(
            <motion.div
                initial={{ x: 100 }}
                tap={{ opacity: 0 }}
                dragEnabled
                style={{ opacity: 1 }}
            />
        )

        expect(true).toBe(true)
    })
})
