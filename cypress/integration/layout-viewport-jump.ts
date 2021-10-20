interface BoundingBox {
    top: number
    left: number
    width: number
    height: number
}

function expectBbox(element: HTMLElement, expectedBbox: BoundingBox) {
    const bbox = element.getBoundingClientRect()
    expect(Math.floor(bbox.top)).to.equal(expectedBbox.top)
    expect(Math.floor(bbox.width)).to.equal(expectedBbox.width)
    expect(Math.floor(bbox.height)).to.equal(expectedBbox.height)
}

describe("Viewport jump", () => {
    it("If viewport jumps, don't trigger layout animation", () => {
        cy.viewport(1000, 600)
            .visit("?test=layout-viewport-jump")
            .wait(50)
            .get("#box")
            .should(([$box]: any) => {
                expectBbox($box, {
                    height: 100,
                    top: 100,
                    width: 100,
                })
            })
        cy.scrollTo(0, 100)
            .get("#box")
            .should(([$box]: any) => {
                expectBbox($box, {
                    height: 100,
                    top: 0,
                    width: 100,
                })
            })
            .trigger("click")
            .wait(50)
            .should(([$box]: any) => {
                expectBbox($box, {
                    height: 100,
                    top: 100,
                    width: 100,
                })
            })
    })

    /**
     * This passes locally but can't get it to pass in Cypress
     */
    it("If div scroll jumps, don't trigger layout animation if provided layoutScroll prop", () => {
        cy.viewport(1000, 600)
            .visit("?test=layout-viewport-jump&nested=true")
            .wait(50)
            .get("#box")
            .should(([$box]: any) => {
                expectBbox($box, {
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
                    height: 100,
                    top: 0,
                    width: 100,
                })
            })
            .trigger("click")
            .wait(50)
            .should(([$box]: any) => {
                expectBbox($box, {
                    height: 100,
                    top: 100,
                    width: 100,
                })
            })
    })
})
