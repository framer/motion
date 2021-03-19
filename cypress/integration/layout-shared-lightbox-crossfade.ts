interface BoundingBox {
    top: number
    left: number
    width: number
    height: number
}

function expectBbox(element: HTMLElement, expectedBbox: BoundingBox) {
    const bbox = element.getBoundingClientRect()
    expect(bbox.top).to.equal(expectedBbox.top)
    expect(bbox.left).to.equal(expectedBbox.left)
    expect(bbox.width).to.equal(expectedBbox.width)
    expect(bbox.height).to.equal(expectedBbox.height)
}

function runScript(args: string) {
    cy.visit(`?test=layout-shared-lightbox-crossfade${args}`)
        .wait(50)
        .get("#item-parent")
        .should(([$box]: any) => {
            expectBbox($box, {
                top: 40,
                left: 210,
                width: 180,
                height: 580,
            })
        })
        .get("#item-child")
        .should(([$box]: any) => {
            expectBbox($box, {
                top: 305,
                left: 275,
                width: 50,
                height: 50,
            })
        })
        // Open lightbox
        .trigger("click")
        .wait(50)
        .get("#item-parent")
        .should(([$box]: any) => {
            expect(window.getComputedStyle($box).borderRadius).to.equal(
                "8.33333% / 12.5%"
            )
            expect(window.getComputedStyle($box).opacity).to.equal("0")
            expectBbox($box, {
                top: 130,
                left: 800,
                width: 600,
                height: 400,
            })
        })
        .get("#item-child")
        .should(([$box]: any) => {
            expect(window.getComputedStyle($box).borderRadius).to.equal("50%")
            expect(window.getComputedStyle($box).opacity).to.equal("0.5")
            expectBbox($box, {
                top: 180,
                left: 250,
                width: 50,
                height: 50,
            })
        })
        .get("#parent")
        .should(([$box]: any) => {
            expect(window.getComputedStyle($box).borderRadius).to.equal(
                "8.33333% / 12.5%"
            )
            expect(window.getComputedStyle($box).opacity).to.equal("1")
            expectBbox($box, {
                top: 130,
                left: 800,
                width: 600,
                height: 400,
            })
        })
        .get("#child")
        .should(([$box]: any) => {
            expect(window.getComputedStyle($box).borderRadius).to.equal("50%")
            expect(window.getComputedStyle($box).opacity).to.equal("0.5")
            expectBbox($box, {
                top: 180,
                left: 250,
                width: 50,
                height: 50,
            })
        })
        // Close lightbox
        .trigger("click")
        .wait(50)
        .get("#item-parent")
        .should(([$box]: any) => {
            expect(window.getComputedStyle($box).borderRadius).to.equal("0")
            expect(window.getComputedStyle($box).opacity).to.equal("1")
            expectBbox($box, {
                top: 40,
                left: 210,
                width: 180,
                height: 580,
            })
        })
        .get("#item-child")
        .should(([$box]: any) => {
            expect(window.getComputedStyle($box).borderRadius).to.equal("50%")
            expect(window.getComputedStyle($box).opacity).to.equal("0.5")
            expectBbox($box, {
                top: 305,
                left: 275,
                width: 50,
                height: 50,
            })
        })
}

describe("AnimateSharedLayout lightbox example, crossfade", () => {
    it("Correctly animates between items and lightbox with instant transition", () => {
        runScript("&instant=true")
    })
    it("Correctly animates between items and lightbox with very fast transition", () => {
        runScript("")
    })
})
