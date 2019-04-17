import "../../../jest.setup"
import { render } from "react-testing-library"
import { motion } from "../../motion"
import * as React from "react"

describe("css variables", () => {
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
    let originalGetComputedStyle: any
    beforeAll(() => {
        originalGetComputedStyle = window.getComputedStyle
        ;(window as any).getComputedStyle = () => {
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
    })

    afterAll(() => {
        window.getComputedStyle = originalGetComputedStyle
    })

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

    test("should put back the original target css variable on animation end", async () => {
        const promise = new Promise<ChildNode | null>(resolve => {
            const resolvePromise = () => {
                // requestAnimationFrame(() => resolve(container.firstChild))
                setTimeout(() => {
                    resolve(container.firstChild)
                }, 100)
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

        const element: any = await promise

        expect(element.style).toEqual(
            expect.objectContaining({ background: "var(--to)" })
        )
    })
})
