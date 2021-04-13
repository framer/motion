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

function testNestedDrag(parentLayout: boolean, childLayout: boolean) {
    let url = `?test=drag-layout-nested`
    if (parentLayout) url += `&parentLayout=true`
    if (childLayout) url += `&childLayout=true`

    cy.visit(url)
        .wait(50)
        .get("#parent")
        .should(([$parent]: any) => {
            expectBbox($parent, {
                top: 100,
                left: 100,
                width: 300,
                height: 300,
            })
        })

        .get("#child")
        .should(([$child]: any) => {
            expectBbox($child, {
                top: 150,
                left: 150,
                width: 600,
                height: 200,
            })
        })
        .get("#parent")
        .trigger("pointerdown", 5, 5)
        .trigger("pointermove", 10, 10) // Gesture will start from first move past threshold
        .wait(50)
        .trigger("pointermove", 50, 50)
        .wait(50)
        .trigger("pointerup")
        .should(([$parent]: any) => {
            expectBbox($parent, {
                top: 150,
                left: 150,
                width: 300,
                height: 300,
            })
        })
        .get("#child")
        .should(([$child]: any) => {
            expectBbox($child, {
                top: 200,
                left: 200,
                width: 600,
                height: 200,
            })
        })
        .trigger("pointerdown", 5, 5)
        .trigger("pointermove", 10, 10) // Gesture will start from first move past threshold
        .wait(50)
        .trigger("pointermove", 50, 50)
        .wait(50)
        .trigger("pointerup")
        .get("#parent")
        .should(([$parent]: any) => {
            expectBbox($parent, {
                top: 150,
                left: 150,
                width: 300,
                height: 300,
            })
        })
        .get("#child")
        .should(([$child]: any) => {
            expectBbox($child, {
                top: 250,
                left: 250,
                width: 600,
                height: 200,
            })
        })
        .get("#parent")
        .trigger("pointerdown", 5, 5)
        .trigger("pointermove", 10, 10) // Gesture will start from first move past threshold
        .wait(50)
        .trigger("pointermove", 50, 50)
        .wait(50)
        .trigger("pointerup")
        .get("#parent")
        .should(([$parent]: any) => {
            expectBbox($parent, {
                top: 200,
                left: 200,
                width: 300,
                height: 300,
            })
        })
        .get("#child")
        .should(([$child]: any) => {
            expectBbox($child, {
                top: 300,
                left: 300,
                width: 600,
                height: 200,
            })
        })
    // .trigger("pointerdown", 5, 5)
    // .trigger("pointermove", 10, 10) // Gesture will start from first move past threshold
    // .wait(50)
    // .trigger("pointermove", 100, 100, { force: true })
    // .wait(50)
    // .trigger("pointerup", { force: true })
    // .should(([$parent]: any) => {
    //     expectBbox($parent, {
    //         top: 200,
    //         left: 300,
    //         width: 300,
    //         height: 300,
    //     })
    // })
    // .get("#child")
    // .should(([$child]: any) => {
    //     expectBbox($child, {
    //         top: 350,
    //         left: 450,
    //         width: 600,
    //         height: 200,
    //     })
    // })
}

describe("Nested drag", () => {
    it("Parent: layout, Child: layout", () => testNestedDrag(true, true))
    it("Parent: layout", () => testNestedDrag(true, false))
    it("Child: layout", () => testNestedDrag(false, true))
    it("Neither", () => testNestedDrag(false, false))
})
