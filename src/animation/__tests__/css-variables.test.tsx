import { render } from "../../../jest.setup"
import { motion } from "../.."
import * as React from "react"
import { parseCSSVariable } from "../../render/dom/utils/css-variables-conversion"

const fromName = "--from"
const toName = "--to"
const fromValue = "#09F"
const toValue = "#F00"
const fromVariable = `var(${fromName})`
const toVariable = `var(${toName})`

const style = {
    [fromName]: fromValue,
    [toName]: toValue,
} as React.CSSProperties

// Stub getPropertyValue because CSS variables aren't supported by JSDom

const originalGetComputedStyle = window.getComputedStyle

function getComputedStyleStub() {
    return {
        getPropertyValue(variableName: "--from" | "--to") {
            switch (variableName) {
                case fromName:
                    return fromValue
                case toName:
                    return toValue
                default:
                    throw Error("Should never happen")
            }
        },
    }
}

function stubGetComputedStyles() {
    ;(window as any).getComputedStyle = getComputedStyleStub
}

function resetComputedStyles() {
    window.getComputedStyle = originalGetComputedStyle
}

describe("css variables", () => {
    beforeAll(stubGetComputedStyles)
    afterAll(resetComputedStyles)

    test("should animate css color variables", async () => {
        const promise = new Promise(resolve => {
            let isFirstFrame = true
            const Component = () => (
                <motion.div
                    style={style}
                    initial={{ background: fromVariable }}
                    animate={{ background: toVariable }}
                    onUpdate={({ background }) => {
                        if (isFirstFrame) {
                            isFirstFrame = false
                        } else {
                            resolve(background)
                        }
                    }}
                />
            )

            const { rerender } = render(<Component />)
            rerender(<Component />)
        })
        const resolvedAs = await promise

        // We're running this on the second frame to ensure and checking that
        // the resolved color *isn't* the start or target value. We want it to be an interpolation
        // of the two to ensure it's actually animating and not just switching between them.
        expect(resolvedAs).not.toBe(fromValue)
        expect(resolvedAs).not.toBe(toValue)
        expect(resolvedAs).not.toBe(fromVariable)
        expect(resolvedAs).not.toBe(toVariable)
    })

    // Skipping because this test always succeeds, no matter what style values you check for ¯\\_(ツ)_/¯
    test.skip("should have the original target css variable on animation end", async () => {
        const promise = new Promise<ChildNode | null>(resolve => {
            const resolvePromise = () => {
                requestAnimationFrame(() => resolve(container.firstChild))
            }

            const Component = () => {
                return (
                    <motion.div
                        style={style}
                        initial={{ background: fromVariable }}
                        animate={{ background: toVariable }}
                        // transition={{ duration: 0.01 }}
                        onAnimationComplete={resolvePromise}
                    />
                )
            }

            const { container, rerender } = render(<Component />)

            rerender(<Component />)
        })

        resetComputedStyles()
        const result = expect(promise).resolves.toHaveStyle(
            `background: ${toVariable}`
        )
        stubGetComputedStyles()
        return result
    })

    test("css variable parsing", () => {
        expect(parseCSSVariable("var(--ID-123)")).toEqual([
            "--ID-123",
            undefined,
        ])
    })

    test("css variable parsing fallback", () => {
        expect(parseCSSVariable("var(--ID-123, red)")).toEqual([
            "--ID-123",
            "red",
        ])
    })

    test("css variable parsing nested fallback", () => {
        expect(parseCSSVariable("var(--ID-123, var(--ID-234, cyan))")).toEqual([
            "--ID-123",
            "var(--ID-234, cyan)",
        ])
    })

    test("css variable parsing ignores metadata", () => {
        expect(
            parseCSSVariable('var(--ID-123) /* { "name": "whatever" } */')
        ).toEqual(["--ID-123", undefined])
    })

    test("css variable detects fallback values with decimal", () => {
        expect(
            parseCSSVariable(
                'var(--foo, rgba(255, 204, 0, 0.35)) /* {"name":"Whaa"} */'
            )
        ).toEqual(["--foo", "rgba(255, 204, 0, 0.35)"])
    })
})
