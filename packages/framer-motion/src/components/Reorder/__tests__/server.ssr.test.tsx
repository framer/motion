import * as React from "react"
import { renderToString, renderToStaticMarkup } from "react-dom/server"
import { useState } from "react"
import { ReorderGroup, ReorderItem } from ".."

describe("Reorder", () => {
    it("Correctly renders HTML", () => {
        const Component = () => (
            <ReorderGroup as="article" onReorder={() => {}} values={[]}>
                <ReorderItem as="main" value={0} />
            </ReorderGroup>
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
                <ReorderGroup as="article" onReorder={setItems} values={[]}>
                    <ReorderItem as="main" value={0} />
                </ReorderGroup>
            )
        }

        const staticMarkup = renderToStaticMarkup(<Component />)
        const string = renderToString(<Component />)

        const expectedMarkup = `<article><main style="z-index:unset;transform:none;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;touch-action:pan-x" draggable="false"></main></article>`

        expect(staticMarkup).toBe(expectedMarkup)
        expect(string).toBe(expectedMarkup)
    })
})
