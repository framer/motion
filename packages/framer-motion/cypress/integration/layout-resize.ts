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
    it("Finishes the animation and blocks animation on immediate layout animations until 250ms", () => {
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
            .get("#child")
            .should(([$box]: any) => {
                expectBbox($box, {
                    top: 0,
                    left: 0,
                    width: 100,
                    height: 100,
                })
            })
            .get("#box")
            .trigger("click")
            .wait(50)
            .viewport(200, 200)
            .wait(100)
            .get("#box")
            .should(([$box]: any) => {
                expectBbox($box, {
                    top: 100,
                    left: 100,
                    width: 400,
                    height: 200,
                })
            })
            .get("#child")
            .should(([$box]: any) => {
                expectBbox($box, {
                    top: 100,
                    left: 100,
                    width: 100,
                    height: 100,
                })
            })
            .get("#box")
            .trigger("click", { force: true })
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
            .get("#child")
            .should(([$box]: any) => {
                expectBbox($box, {
                    top: 0,
                    left: 0,
                    width: 100,
                    height: 100,
                })
            })
            .get("#box")
            .wait(200)
            .trigger("click", { force: true })
            .wait(300)
            .should(([$box]: any) => {
                const bbox = $box.getBoundingClientRect()
                expect(Math.round(bbox.top)).not.to.equal(0)
                expect(Math.round(bbox.top)).not.to.equal(100)
            })
    })
})
