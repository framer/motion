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

describe("Layout animation", () => {
    it("Correctly fires layout={true} animations and fires onLayoutAnimationComplete", () => {
        cy.visit("?test=layout")
            .wait(50)
            .get("#box")
            .should(([$box]: any) => {
                expectBbox($box, {
                    top: 0,
                    left: 0,
                    width: 100,
                    height: 200,
                })
            })
            .trigger("click")
            .wait(50)
            .should(([$box]: any) => {
                expectBbox($box, {
                    top: 50,
                    left: 100,
                    width: 200,
                    height: 250,
                })
            })
            /**
             * Test that onLayoutAnimationComplete fires
             */
            .wait(200)
            .should(([$box]: any) => {
                expect($box.style.backgroundColor).to.equal("blue")
            })
    })

    it(`It correctly fires layout="position" animations`, () => {
        cy.visit("?test=layout&type=position")
            .wait(50)
            .get("#box")
            .should(([$box]: any) => {
                expectBbox($box, {
                    top: 0,
                    left: 0,
                    width: 100,
                    height: 200,
                })
            })
            .trigger("click")
            .wait(50)
            .should(([$box]: any) => {
                expectBbox($box, {
                    top: 50,
                    left: 100,
                    width: 300,
                    height: 300,
                })
            })
    })

    it.skip("Doesn't initiate a new animation if the viewport box hasn't updated between renders", () => {
        cy.visit("?test=layout-interrupt")
            .wait(50)
            .get("#box")
            .should(([$box]: any) => {
                expectBbox($box, {
                    top: 0,
                    left: 0,
                    width: 100,
                    height: 200,
                })
            })
            .trigger("click")
            .wait(50)
            .should(([$box]: any) => {
                expectBbox($box, {
                    top: 50,
                    left: 100,
                    width: 200,
                    height: 250,
                })
            })
            /**
             * The easing curve is set to always return t=0.5, so if this box moves it means
             * a new animation has started
             */
            .trigger("click")
            .wait(50)
            .should(([$box]: any) => {
                expectBbox($box, {
                    top: 50,
                    left: 100,
                    width: 200,
                    height: 250,
                })
            })
    })
})
