interface BoundingBox {
    top: number
    left: number
    width: number
    height: number
}

function expectBbox(element: HTMLElement, expectedBbox: BoundingBox) {
    const bbox = element.getBoundingClientRect()
    expect(bbox.left).to.equal(expectedBbox.left)
    expect(bbox.top).to.equal(expectedBbox.top)
    expect(bbox.width).to.equal(expectedBbox.width)
    expect(bbox.height).to.equal(expectedBbox.height)
}

describe("Drag to reorder", () => {
    it("Works correctly with other layout animations", () => {
        cy.visit("?test=drag-to-reorder")
            .wait(50)
            .get("#h60")
            .should(([$item]: any) => {
                expectBbox($item, {
                    top: 0,
                    left: 0,
                    width: 300,
                    height: 60,
                })
            })
            .get("#h40")
            .should(([$item]: any) => {
                expectBbox($item, {
                    top: 160,
                    left: 0,
                    width: 300,
                    height: 40,
                })
            })
            .trigger("pointerdown", 300, 300, { force: true })
            .wait(50)
            .trigger("pointermove", 295, 295, { force: true })
            .wait(50)
            .trigger("pointermove", 200, 200, { force: true })
            .wait(50)
            .should(([$item]: any) => {
                expectBbox($item, {
                    top: 55,
                    left: 0,
                    width: 300,
                    height: 40,
                })
            })
            .get("#h60")
            .should(([$item]: any) => {
                expectBbox($item, {
                    top: 0,
                    left: 0,
                    width: 300,
                    height: 60,
                })
            })
    })
})
