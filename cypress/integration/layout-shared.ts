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

describe("AnimateSharedLayout: A -> B transition", () => {
    it("Correctly fires layout={true} animations and fires onLayoutAnimationComplete", () => {
        cy.visit("?test=layout-shared-switch-a-b")
            .wait(50)
            .get("#a")
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
            .get("#b")
            .should(([$box]: any) => {
                expect(window.getComputedStyle($box).borderRadius).to.equal(
                    "10% / 8%"
                )
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
                expect($box.style.backgroundColor).to.equal("rgb(0, 0, 255)")
            })
            .trigger("click")
            .wait(50)
            .get("#a")
            .should(([$box]: any) => {
                expectBbox($box, {
                    top: 25,
                    left: 50,
                    width: 150,
                    height: 225,
                })
            })
    })

    it(`It correctly fires layout="position" animations`, () => {
        cy.visit("?test=layout-shared-switch-a-b&type=position")
            .wait(50)
            .get("#a")
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
            .get("#b")
            .should(([$box]: any) => {
                expectBbox($box, {
                    top: 50,
                    left: 100,
                    width: 300,
                    height: 300,
                })
            })
            .trigger("click")
            .wait(50)
            .get("#a")
            .should(([$box]: any) => {
                expectBbox($box, {
                    top: 25,
                    left: 50,
                    width: 100,
                    height: 200,
                })
            })
    })

    it(`It correctly fires layout="size" animations`, () => {
        cy.visit("?test=layout-shared-switch-a-b&type=size")
            .wait(50)
            .get("#a")
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
            .get("#b")
            .should(([$box]: any) => {
                expectBbox($box, {
                    top: 50,
                    left: 100,
                    width: 300,
                    height: 300,
                })
            })
            .trigger("click")
            .wait(50)
            .get("#a")
            .should(([$box]: any) => {
                expectBbox($box, {
                    top: 25,
                    left: 50,
                    width: 100,
                    height: 200,
                })
            })
    })
})

describe("AnimateSharedLayout: A -> AB -> A switch transition", () => {
    it.skip("Correctly fires layout={true} animations and fires onLayoutAnimationComplete", () => {
        cy.visit("?test=layout-shared-switch-a-ab")
            .wait(50)
            .get("#a")
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
            .get("#a")
            .should(([$box]: any) => {
                expect($box.style.visibility).to.equal("hidden")
            })
            .get("#b")
            .should(([$box]: any) => {
                expect(parseFloat($box.style.opacity)).to.equal(1)
                expectBbox($box, {
                    top: 50,
                    left: 100,
                    width: 200,
                    height: 250,
                })
            })
            .trigger("click")
            .wait(50)
            .get("#a")
            .should(([$box]: any) => {
                expect($box.style.visibility).not.to.equal("hidden")
                expectBbox($box, {
                    top: 25,
                    left: 50,
                    width: 100,
                    height: 125,
                })
            })
    })

    it.skip(`It correctly fires layout="position" animations`, () => {
        cy.visit("?test=layout-shared-switch-a-ab&type=position")
            .wait(50)
            .get("#a")
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
            .get("#b")
            .should(([$box]: any) => {
                expectBbox($box, {
                    top: 50,
                    left: 100,
                    width: 300,
                    height: 300,
                })
            })
            .trigger("click")
            .wait(50)
            .get("#a")
            .should(([$box]: any) => {
                expectBbox($box, {
                    top: 50,
                    left: 100,
                    width: 100,
                    height: 200,
                })
            })
    })
})

describe("AnimateSharedLayout: 0 -> A -> B -> 0 transition", () => {
    it("Correctly fires layout={true} animations", () => {
        cy.visit("?test=layout-shared-switch-0-a-b-0")
            .wait(50)
            .get("#trigger")
            .trigger("click")
            .wait(50)
            .get("#a")
            .should(([$box]: any) => {
                expectBbox($box, {
                    top: 0,
                    left: 0,
                    width: 100,
                    height: 200,
                })
            })
            .get("#trigger")
            .trigger("click")
            .wait(50)
            .get("#b")
            .should(([$box]: any) => {
                expectBbox($box, {
                    top: 50,
                    left: 100,
                    width: 200,
                    height: 250,
                })
            })
            .get("#trigger")
            .trigger("click")
            .wait(50)
            .get("#a")
            .should(([$box]: any) => {
                expectBbox($box, {
                    top: 25,
                    left: 50,
                    width: 150,
                    height: 225,
                })
            })
    })
})

describe("AnimateSharedLayout: 0 -> A -> AB -> A -> 0 transition", () => {
    it("Correctly fires layout={true} animations", () => {
        cy.visit("?test=layout-shared-switch-0-a-b-0")
            .wait(50)
            .get("#trigger")
            .trigger("click")
            .wait(50)
            .get("#a")
            .should(([$box]: any) => {
                expectBbox($box, {
                    top: 0,
                    left: 0,
                    width: 100,
                    height: 200,
                })
            })
            .get("#trigger")
            .trigger("click")
            .wait(50)
            .get("#b")
            .should(([$box]: any) => {
                expectBbox($box, {
                    top: 50,
                    left: 100,
                    width: 200,
                    height: 250,
                })
            })
            .get("#trigger")
            .trigger("click")
            .wait(50)
            .get("#a")
            .should(([$box]: any) => {
                expectBbox($box, {
                    top: 25,
                    left: 50,
                    width: 150,
                    height: 225,
                })
            })
    })
})

describe("AnimateSharedLayout: A -> B crossfade transition", () => {
    it("Correctly fires layout={true} animations and fires onLayoutAnimationComplete", () => {
        cy.visit("?test=layout-shared-switch-a-b")
            .wait(50)
            .get("#a")
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
            .get("#b")
            .should(([$box]: any) => {
                expect(window.getComputedStyle($box).borderRadius).to.equal(
                    "10% / 8%"
                )
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
            .wait(220)
            .should(([$box]: any) => {
                expect($box.style.backgroundColor).to.equal("rgb(0, 0, 255)")
            })
            .trigger("click")
            .wait(50)
            .get("#a")
            .should(([$box]: any) => {
                expectBbox($box, {
                    top: 25,
                    left: 50,
                    width: 150,
                    height: 225,
                })
            })
    })

    it(`It correctly fires layout="position" animations`, () => {
        cy.visit("?test=layout-shared-switch-a-b&type=position")
            .wait(50)
            .get("#a")
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
            .get("#b")
            .should(([$box]: any) => {
                expectBbox($box, {
                    top: 50,
                    left: 100,
                    width: 300,
                    height: 300,
                })
            })
            .trigger("click")
            .wait(50)
            .get("#a")
            .should(([$box]: any) => {
                expectBbox($box, {
                    top: 25,
                    left: 50,
                    width: 100,
                    height: 200,
                })
            })
    })

    it(`It correctly fires layout="size" animations`, () => {
        cy.visit("?test=layout-shared-switch-a-b&type=size")
            .wait(50)
            .get("#a")
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
            .get("#b")
            .should(([$box]: any) => {
                expectBbox($box, {
                    top: 50,
                    left: 100,
                    width: 300,
                    height: 300,
                })
            })
            .trigger("click")
            .wait(50)
            .get("#a")
            .should(([$box]: any) => {
                expectBbox($box, {
                    top: 25,
                    left: 50,
                    width: 100,
                    height: 200,
                })
            })
    })
})

describe("AnimateSharedLayout: A -> AB -> A crossfade transition", () => {
    it("Correctly fires layout={true} animations and fires onLayoutAnimationComplete", () => {
        cy.visit("?test=layout-shared-crossfade-a-ab")
            .wait(50)
            .get("#a")
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
            .get("#a")
            .should(([$box]: any) => {
                expect(parseFloat($box.style.opacity)).to.equal(1)
                expectBbox($box, {
                    top: 50,
                    left: 100,
                    width: 200,
                    height: 250,
                })
            })
            .get("#b")
            .should(([$box]: any) => {
                expect(parseFloat($box.style.opacity)).to.equal(1)
                expectBbox($box, {
                    top: 50,
                    left: 100,
                    width: 200,
                    height: 250,
                })
            })
        // .trigger("click")
        // .wait(50)
        // .get("#a")
        // .should(([$box]: any) => {
        //     expect($box.style.visibility).not.to.equal("hidden")
        //     expectBbox($box, {
        //         top: 25,
        //         left: 50,
        //         width: 100,
        //         height: 125,
        //     })
        // })
        // .get("#b")
        // .should(([$box]: any) => {
        //     expect($box.style.visibility).not.to.equal("hidden")
        //     expectBbox($box, {
        //         top: 25,
        //         left: 50,
        //         width: 100,
        //         height: 125,
        //     })
        // })
    })

    it.skip(`It correctly fires layout="position" animations`, () => {
        cy.visit("?test=layout-shared-crossfade-a-ab&type=position")
            .wait(50)
            .get("#a")
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
            .get("#a")
            .should(([$box]: any) => {
                expectBbox($box, {
                    top: 50,
                    left: 100,
                    width: 300,
                    height: 300,
                })
            })
            .get("#b")
            .should(([$box]: any) => {
                expectBbox($box, {
                    top: 50,
                    left: 100,
                    width: 300,
                    height: 300,
                })
            })
            .trigger("click")
            .wait(50)
            .get("#a")
            .should(([$box]: any) => {
                expectBbox($box, {
                    top: 50,
                    left: 100,
                    width: 100,
                    height: 200,
                })
            })
            .get("#b")
            .should(([$box]: any) => {
                expectBbox($box, {
                    top: 50,
                    left: 100,
                    width: 100,
                    height: 200,
                })
            })
    })
})

describe("AnimateSharedLayout: 0 -> A -> B -> 0 crossfade transition", () => {
    it("Correctly fires layout={true} animations", () => {
        cy.visit("?test=layout-shared-switch-0-a-b-0")
            .wait(50)
            .get("#trigger")
            .trigger("click")
            .wait(50)
            .get("#a")
            .should(([$box]: any) => {
                expectBbox($box, {
                    top: 0,
                    left: 0,
                    width: 100,
                    height: 200,
                })
            })
            .get("#trigger")
            .trigger("click")
            .wait(50)
            .get("#b")
            .should(([$box]: any) => {
                expectBbox($box, {
                    top: 50,
                    left: 100,
                    width: 200,
                    height: 250,
                })
            })
            .get("#trigger")
            .trigger("click")
            .wait(50)
            .get("#a")
            .should(([$box]: any) => {
                expectBbox($box, {
                    top: 25,
                    left: 50,
                    width: 150,
                    height: 225,
                })
            })
    })
})

describe("AnimateSharedLayout:  0 -> A -> AB -> A -> 0 crossfade transition", () => {
    it("Correctly fires layout={true} animations", () => {
        cy.visit("?test=layout-shared-switch-0-a-b-0")
            .wait(50)
            .get("#trigger")
            .trigger("click")
            .wait(50)
            .get("#a")
            .should(([$box]: any) => {
                expectBbox($box, {
                    top: 0,
                    left: 0,
                    width: 100,
                    height: 200,
                })
            })
            .get("#trigger")
            .trigger("click")
            .wait(50)
            .get("#b")
            .should(([$box]: any) => {
                expectBbox($box, {
                    top: 50,
                    left: 100,
                    width: 200,
                    height: 250,
                })
            })
            .trigger("click")
            .wait(50)
            .get("#a")
            .should(([$box]: any) => {
                expectBbox($box, {
                    top: 25,
                    left: 50,
                    width: 150,
                    height: 225,
                })
            })
    })
})
