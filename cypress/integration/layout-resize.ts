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

describe("Resize window", () => {
    it("Finishes the animation", () => {
        cy.visit("?test=layout-resize")
            .wait(50)
            .get("#box")
            .should(([$box]: any) => {
                expectBbox($box, {
                    top: 0,
                    left: 0,
                    width: 100,
                    height: 100,
                })
            })
            .trigger("click")
            .wait(50)
            .viewport(200, 200)
            .wait(100)
            .get("#box")
            .should(([$box]: any) => {
                expectBbox($box, {
                    top: 100,
                    left: 100,
                    width: 200,
                    height: 200,
                })
            })
    })
})
