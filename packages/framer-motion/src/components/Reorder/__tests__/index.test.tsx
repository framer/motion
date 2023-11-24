import { render } from "../../../../jest.setup"
import * as React from "react"
import { useRef, useLayoutEffect } from "react"
import { ReorderGroup, ReorderItem } from ".."

describe("Reorder", () => {
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
                <ReorderGroup
                    as="article"
                    ref={groupRef}
                    onReorder={() => {}}
                    values={[]}
                >
                    <ReorderItem as="main" ref={itemRef} value={0} />
                </ReorderGroup>
            )
        }

        render(<Component />)
        expect(groupRefPass).toBe(true)
        expect(itemRefPass).toBe(true)
    })
})
