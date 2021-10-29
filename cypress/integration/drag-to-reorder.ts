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

describe("Drag to reorder", () => {
    it("Y axis", () => {
        cy.visit("?test=drag-to-reorder")
            .wait(50)
            .get("#Tomato")
            .should(([$item]: any) => {
                expectBbox($item, {
                    height: 68,
                    left: 350,
                    top: 174,
                    width: 340,
                })
            })
            .get("#Cucumber")
            .should(([$item]: any) => {
                expectBbox($item, {
                    height: 68,
                    left: 350,
                    top: 252,
                    width: 340,
                })
            })
            .get("#Tomato")
            .trigger("pointerdown", 360, 175, { force: true })
            .wait(50)
            .trigger("pointermove", 360, 180, { force: true })
            .wait(50)
            .trigger("pointermove", 360, 200, { force: true })
            .wait(50)
            .trigger("pointermove", 360, 220, { force: true })
            .wait(100)
            .should(([$item]: any) => {
                expectBbox($item, {
                    height: 68,
                    left: 350,
                    top: 249,
                    width: 340,
                })
            })
            .get("#Cucumber")
            .should(([$item]: any) => {
                expectBbox($item, {
                    height: 68,
                    left: 350,
                    top: 174,
                    width: 340,
                })
            })
            .get("#Tomato")
            .trigger("pointerup", 360, 220, { force: true })
            .wait(100)
            .should(([$item]: any) => {
                expectBbox($item, {
                    height: 68,
                    left: 350,
                    top: 252,
                    width: 340,
                })
            })
            .get("#Cucumber")
            .trigger("pointerdown", 360, 175, { force: true })
            .wait(50)
            .trigger("pointermove", 360, 180, { force: true })
            .wait(50)
            .trigger("pointermove", 360, 200, { force: true })
            .wait(50)
            .trigger("pointermove", 360, 220, { force: true })
            .wait(100)
            .should(([$item]: any) => {
                expectBbox($item, {
                    height: 68,
                    left: 350,
                    top: 249,
                    width: 340,
                })
            })
            .get("#Tomato")
            .should(([$item]: any) => {
                expectBbox($item, {
                    height: 68,
                    left: 350,
                    top: 174,
                    width: 340,
                })
            })
    })

    it("X axis", () => {
        cy.visit("?test=drag-to-reorder&axis=x")
            .wait(50)
            .get("#Tomato")
            .should(([$item]: any) => {
                expectBbox($item, {
                    height: 68,
                    left: 350,
                    top: 291,
                    width: 340,
                })
            })
            .get("#Cucumber")
            .should(([$item]: any) => {
                expectBbox($item, {
                    height: 68,
                    left: 690,
                    top: 291,
                    width: 340,
                })
            })
            .get("#Tomato")
            .trigger("pointerdown", 360, 175, { force: true })
            .wait(50)
            .trigger("pointermove", 365, 175, { force: true })
            .wait(50)
            .trigger("pointermove", 425, 175, { force: true })
            .wait(50)
            .trigger("pointermove", 475, 175, { force: true })
            .wait(100)
            .should(([$item]: any) => {
                expectBbox($item, {
                    height: 68,
                    left: 535,
                    top: 291,
                    width: 340,
                })
            })
            .get("#Cucumber")
            .should(([$item]: any) => {
                expectBbox($item, {
                    height: 68,
                    left: 350,
                    top: 291,
                    width: 340,
                })
            })
    })
})
