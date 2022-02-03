interface BoundingBox {
    top: number
    left: number
    width: number
    height: number
}

function expectBbox(element: HTMLElement, expectedBbox: BoundingBox) {
    const bbox = element.getBoundingClientRect()
    expect(Math.round(bbox.left)).to.equal(expectedBbox.left)
}

describe("Layout animation: Instant layout undo", () => {
    it("Correctly cancels animation", () => {
        cy.visit(`?test=layout-instant-undo`)
            .wait(50)
            .get("#box")
            .should(([$parent]: any) => {
                expectBbox($parent, { left: 200 })
            })
            .click()
            .wait(50)
            .should(([$parent]: any) => {
                expectBbox($parent, { left: 200 })
            })
    })
})
