import { render } from "../../../jest.setup"
import { motion } from "../../"
import { useMotionValue, useTransform } from "../../"
import * as React from "react"
import { motionValue } from "../../value"

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

    test("recognises MotionValues in attributes", () => {
        let r = motionValue(0)
        let fill = motionValue("#000")

        const Component = () => {
            r = useMotionValue(40)
            fill = useTransform(r, [40, 100], ["#00f", "#f00"])

            return (
                <svg>
                    <motion.circle
                        cx={125}
                        cy={125}
                        r={r}
                        fill={fill}
                        animate={{ r: 100 }}
                        transition={{ type: false }}
                    />
                </svg>
            )
        }

        const { rerender } = render(<Component />)
        rerender(<Component />)

        expect(r.get()).toBe(100)
        expect(fill.get()).toBe("rgba(255, 0, 0, 1)")
    })

    test("motion svg elements should be able to set correct type of ref", () => {
        const Component = () => {
            const ref = React.useRef<SVGTextElement>(null)
            return (
                <svg>
                    <motion.text ref={ref}>Framer Motion</motion.text>
                </svg>
            )
        }
        render(<Component />)
    })

    // https://github.com/framer/motion/issues/216
    test("doesn't throw if animating unencounterd value", () => {
        const animation = {
            strokeDasharray: ["1px, 200px", "100px, 200px", "100px, 200px"],
            strokeDashoffset: [0, -15, -125],
            transition: { duration: 1.4, ease: "linear" },
        }

        const Component = () => {
            return (
                <motion.svg animate={{ rotate: 100 }}>
                    <motion.circle animate={animation} />
                </motion.svg>
            )
        }
        render(<Component />)
    })
})
