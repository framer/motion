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

/**
 * TODO: This isn't failing as expected
 *
 * if (!node.resumeFrom) { -> if (!node.resumeFrom && !hasLayoutChanged) {
 *
 * To see breaking behaviour. Perhaps if we could hold the second animation somehow.
 */
describe("Relative projection targets", () => {
    it("If the target didn't change but the relative target changes, starts a new animation", () => {
        cy.visit(`?test=layout-relative-target-change`)
            .wait(50)
            .get("#box")
            .should(([$box]: any) => {
                expectBbox($box, {
                    left: 0,
                    top: 100,
                    width: 80,
                    height: 80,
                })
            })
            .get("#inner-box")
            .should(([$box]: any) => {
                expectBbox($box, {
                    left: 20,
                    top: 120,
                    height: 40,
                    width: 40,
                })
            })
            .get("#parent")
            .trigger("click")
            .wait(50)
            .get("#box")
            .should(([$box]: any) => {
                expectBbox($box, {
                    left: 200,
                    top: 100,
                    height: 80,
                    width: 80,
                })
            })
            .get("#inner-box")
            .should(([$box]: any) => {
                expectBbox($box, {
                    left: 220,
                    top: 120,
                    height: 40,
                    width: 40,
                })
            })
            // scale the box
            .get("#box")
            .trigger("click")
            .wait(10)
            .get("#inner-box")
            .should(([$box]: any) => {
                expectBbox($box, {
                    left: 220,
                    top: 120,
                    height: 40,
                    width: 40,
                })
            })
    })
})
