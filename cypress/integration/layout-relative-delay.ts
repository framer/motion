interface BoundingBox {
    top: number
    left: number
    width: number
    height: number
}

function expectBbox(element: HTMLElement, expectedBbox: BoundingBox) {
    const bbox = element.getBoundingClientRect()
    expect(Math.round(bbox.left)).to.equal(expectedBbox.left)
    expect(Math.round(bbox.top)).to.equal(expectedBbox.top)
    expect(Math.round(bbox.width)).to.equal(expectedBbox.width)
    expect(Math.round(bbox.height)).to.equal(expectedBbox.height)
}

describe("Relative projection targets: Delay", () => {
    it("Child correctly follows parent", () => {
        cy.visit(`?test=layout-relative-delay`)
            .wait(50)
            .get("#parent")
            .should(([$parent]: any) => {
                expectBbox($parent, {
                    top: 0,
                    left: 0,
                    width: 200,
                    height: 200,
                })
            })
            .get("#child")
            .should(([$child]: any) => {
                expectBbox($child, {
                    top: 0,
                    left: 0,
                    width: 100,
                    height: 100,
                })
            })
            .get("#parent")
            .trigger("click")
            .wait(50)
            .get("#parent")
            .should(([$parent]: any) => {
                expectBbox($parent, {
                    top: 100,
                    left: 100,
                    width: 300,
                    height: 200,
                })
            })
            .get("#child")
            .should(([$child]: any) => {
                expectBbox($child, {
                    top: 100,
                    left: 100,
                    width: 100,
                    height: 100,
                })
            })
    })
})
