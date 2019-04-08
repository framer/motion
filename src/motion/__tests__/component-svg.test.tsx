import "../../../jest.setup"
import { render } from "react-testing-library"
import { motion } from "../"
import * as React from "react"

describe("SVG", () => {
    // We can't offer SSR support for transforms as the sanitisation (as in mental
    // sanity) of the SVG transform model relies on measuring the dimensions
    // of the SVG element. So we prevent the setting of initial CSS properties
    // that may be in conflict.
    test("sets initial attributes", () => {
        const { getByTestId } = render(
            <svg>
                <motion.g data-testid="g" initial={{ x: 100 }} />
            </svg>
        )

        expect(getByTestId("g")).not.toHaveStyle(
            "transform: translateX(100px) translateZ(0)"
        )
    })
})
