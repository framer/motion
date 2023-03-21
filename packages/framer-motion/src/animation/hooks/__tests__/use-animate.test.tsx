import * as React from "react"
import { useEffect } from "react"
import { render } from "@testing-library/react"
import { useAnimate } from "../use-animate"
import { sync } from "../../../frameloop"

describe("useAnimate", () => {
    test("Types work as expected", () => {
        const Component = () => {
            const [scope, animate] = useAnimate()

            useEffect(() => {
                expect(() => {
                    animate("div", { opacity: 1 })
                }).toThrow()

                animate(scope.current, { opacity: 1 })
            })

            return <div ref={scope} />
        }

        render(<Component />)
    })

    test("Animates provided animation", async () => {
        return new Promise<void>((resolve) => {
            const Component = () => {
                const [scope, animate] = useAnimate()

                useEffect(() => {
                    animate(
                        scope.current,
                        { opacity: 0.5 },
                        { duration: 0.1 }
                    ).then(() => {
                        expect(scope.current).toHaveStyle("opacity: 0.5;")
                        resolve()
                    })
                })

                return <div ref={scope} />
            }

            render(<Component />)
        })
    })

    test("Stops animations when unmounted", async () => {
        let frameCount = 0
        let unmount = () => {}
        let prevOpacity: string

        await new Promise<void>((resolve) => {
            const Component = () => {
                const [scope, animate] = useAnimate()

                useEffect(() => {
                    sync.update(() => {
                        if (
                            scope.current &&
                            scope.current.style.opacity !== prevOpacity
                        ) {
                            frameCount++

                            if (frameCount === 3) {
                                unmount()
                                setTimeout(() => {
                                    resolve()
                                }, 50)
                            }
                        }
                    }, true)

                    animate(scope.current, { opacity: 0.5 }, { duration: 20 })
                })

                return <div ref={scope} />
            }

            unmount = render(<Component />).unmount
        })

        expect(frameCount).toEqual(3)
    })
})
