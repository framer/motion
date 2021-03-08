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

function testNestedDrag(query: string) {
    cy.visit(`?test=drag-layout-nested&${query}`)
        .wait(50)
        .get("#parent")
        .should(([$parent]: any) => {
            expectBbox($parent, {
                top: 100,
                left: 200,
                width: 300,
                height: 300,
            })
        })

        .get("#child")
        .should(([$child]: any) => {
            expectBbox($child, {
                top: 150,
                left: 250,
                width: 600,
                height: 200,
            })
        })
        .get("#parent")
        .trigger("pointerdown", 5, 5)
        .trigger("pointermove", 10, 10) // Gesture will start from first move past threshold
        .wait(50)
        .trigger("pointermove", 100, 100, { force: true })
        .wait(50)
        .trigger("pointerup", { force: true })
        .should(([$parent]: any) => {
            expectBbox($parent, {
                top: 200,
                left: 300,
                width: 300,
                height: 300,
            })
        })
        .get("#child")
        .should(([$child]: any) => {
            expectBbox($child, {
                top: 250,
                left: 350,
                width: 600,
                height: 200,
            })
        })
        .trigger("pointerdown", 5, 5)
        .trigger("pointermove", 10, 10) // Gesture will start from first move past threshold
        .wait(50)
        .trigger("pointermove", 100, 100, { force: true })
        .wait(50)
        .trigger("pointerup", { force: true })
        .should(([$parent]: any) => {
            expectBbox($parent, {
                top: 200,
                left: 300,
                width: 300,
                height: 300,
            })
        })
        .get("#child")
        .should(([$child]: any) => {
            expectBbox($child, {
                top: 350,
                left: 450,
                width: 600,
                height: 200,
            })
        })
}

describe.skip("Nested drag", () => {
    it("Parent: layout, Child: layout", () =>
        testNestedDrag("parentLayout=true&childLayout=true"))
    it("Parent: layout", () => testNestedDrag("parentLayout=true"))
    it("Child: layout", () => testNestedDrag("childLayout=true"))
})
