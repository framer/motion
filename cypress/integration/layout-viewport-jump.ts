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

describe("Viewport jump", () => {
    it("If viewport jumps, don't trigger layout animation", () => {
        cy.visit("?test=layout-viewport-jump")
            .wait(50)
            .get("#box")
            .should(([$box]: any) => {
                expectBbox($box, {
                    left: 443,
                    height: 100,
                    top: 100,
                    width: 100,
                })
            })
        cy.scrollTo(0, 100)
            .get("#box")
            .should(([$box]: any) => {
                expectBbox($box, {
                    left: 443,
                    height: 100,
                    top: 0,
                    width: 100,
                })
            })
            .trigger("click")
            .wait(50)
            .should(([$box]: any) => {
                expectBbox($box, {
                    left: 443,
                    height: 100,
                    top: 100,
                    width: 100,
                })
            })
    })

    /**
     * This passes locally but can't get it to pass in Cypress
     */
    it.skip("If div scroll jumps, don't trigger layout animation if provided shouldMeasureScroll prop", () => {
        cy.visit("?test=layout-viewport-jump&nested=true")
            .wait(50)
            .get("#box")
            .should(([$box]: any) => {
                expectBbox($box, {
                    left: 443,
                    height: 100,
                    top: 100,
                    width: 100,
                })
            })
            .get("#scrollable")
            .scrollTo(0, 100)
            .get("#box")
            .should(([$box]: any) => {
                expectBbox($box, {
                    left: 443,
                    height: 100,
                    top: 0,
                    width: 100,
                })
            })
            .trigger("click")
            .wait(50)
            .should(([$box]: any) => {
                expectBbox($box, {
                    left: 443,
                    height: 100,
                    top: 100,
                    width: 100,
                })
            })
    })
})
