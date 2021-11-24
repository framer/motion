import { render } from "../../../../jest.setup"
import * as React from "react"
import { renderToString, renderToStaticMarkup } from "react-dom/server"
import { useRef, useLayoutEffect, useState } from "react"
import { Reorder } from ".."

describe("Reorder", () => {
    it("Correctly renders HTML", () => {
        const Component = () => (
            <Reorder.Group as="article" onReorder={() => {}} values={[]}>
                <Reorder.Item as="main" value={0} />
            </Reorder.Group>
        )

        const staticMarkup = renderToStaticMarkup(<Component />)
        const string = renderToString(<Component />)

        const expectedMarkup = `<article><main style="z-index:unset;transform:none;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;touch-action:pan-x" draggable="false"></main></article>`

        expect(staticMarkup).toBe(expectedMarkup)
        expect(string).toBe(expectedMarkup)
    })

    it("onReorder is typed correctly", () => {
        const Component = () => {
            const [_items, setItems] = useState(["a"])
            return (
                <Reorder.Group as="article" onReorder={setItems} values={[]}>
                    <Reorder.Item as="main" value={0} />
                </Reorder.Group>
            )
        }

        const staticMarkup = renderToStaticMarkup(<Component />)
        const string = renderToString(<Component />)

        const expectedMarkup = `<article><main style="z-index:unset;transform:none;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;touch-action:pan-x" draggable="false"></main></article>`

        expect(staticMarkup).toBe(expectedMarkup)
        expect(string).toBe(expectedMarkup)
    })

    it("Correctly hydrates ref", () => {
        let groupRefPass = false
        let itemRefPass = false

        const Component = () => {
            const groupRef = useRef<HTMLElement>(null)
            const itemRef = useRef<HTMLElement>(null)

            useLayoutEffect(() => {
                if (groupRef.current !== null) {
                    groupRefPass = true
                }

                if (itemRef.current !== null) {
                    itemRefPass = true
                }
            })

            return (
                <Reorder.Group
                    as="article"
                    ref={groupRef}
                    onReorder={() => {}}
                    values={[]}
                >
                    <Reorder.Item as="main" ref={itemRef} value={0} />
                </Reorder.Group>
            )
        }

        render(<Component />)
        expect(groupRefPass).toBe(true)
        expect(itemRefPass).toBe(true)
    })
})
