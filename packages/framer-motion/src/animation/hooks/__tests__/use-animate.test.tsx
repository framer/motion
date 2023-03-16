import * as React from "react"
import { useEffect } from "react"
import { render } from "@testing-library/react"
import { useAnimate } from "../use-animate"

describe("useAnimate", () => {
    test("Types work as expected", () => {
        const Component = () => {
            const [scope, animate] = useAnimate<HTMLDivElement>()

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
})
