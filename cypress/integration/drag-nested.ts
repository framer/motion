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
        .wait(20)
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
}

describe("Nested drag", () => {
    it("Parent: layout, Child: layout", () => testNestedDrag(true, true))
    it("Parent: layout", () => testNestedDrag(true, false))
    it("Child: layout", () => testNestedDrag(false, true))
    it("Neither", () => testNestedDrag(false, false))
})

function testNestedDragConstraints(
    parentLayout: boolean,
    childLayout: boolean
) {
    let url = `?test=drag-layout-nested&constraints=true`
    if (parentLayout) url += `&parentLayout=true`
    if (childLayout) url += `&childLayout=true`

    cy.visit(url)
        .get("#parent")
        .trigger("pointerdown", 40, 40)
        .trigger("pointermove", 35, 35) // Gesture will start from first move past threshold
        .wait(50)
        .trigger("pointermove", 20, 20)
        .wait(50)
        .trigger("pointerup")
        .should(([$parent]: any) => {
            // Should have only moved 10 px to the top
            expectBbox($parent, {
                top: 90,
                left: 75,
                width: 300,
                height: 300,
            })
        })
        .get("#child")
        .should(([$child]: any) => {
            expectBbox($child, {
                top: 140,
                left: 125,
                width: 600,
                height: 200,
            })
        })
        .get("#parent")
        .trigger("pointerdown", 5, 5)
        .trigger("pointermove", 10, 10) // Gesture will start from first move past threshold
        .wait(50)
        .trigger("pointermove", 200, 100)
        .wait(50)
        .trigger("pointerup")
        .should(([$parent]: any) => {
            expectBbox($parent, {
                top: 190,
                left: 200,
                width: 300,
                height: 300,
            })
        })
        .get("#child")
        .should(([$child]: any) => {
            expectBbox($child, {
                top: 240,
                left: 250,
                width: 600,
                height: 200,
            })
        })
        .trigger("pointerdown", 5, 5, { force: true })
        .trigger("pointermove", 10, 10, { force: true }) // Gesture will start from first move past threshold
        .wait(50)
        .trigger("pointermove", 200, 100, { force: true })
        .wait(50)
        .trigger("pointerup")
        .get("#parent")
        .should(([$parent]: any) => {
            expectBbox($parent, {
                top: 190,
                left: 200,
                width: 300,
                height: 300,
            })
        })
        .get("#child")
        .should(([$child]: any) => {
            expectBbox($child, {
                top: 340,
                left: 350,
                width: 600,
                height: 200,
            })
        })
        .wait(20)
        .get("#parent")
        .trigger("pointerdown", { clientX: 210, clientY: 200, force: true })
        .trigger("pointermove", { clientX: 205, clientY: 195, force: true }) // Gesture will start from first move past threshold
        .wait(50)
        .trigger("pointermove", { clientX: 110, clientY: 100, force: true })
        .wait(50)
        .trigger("pointerup")
        .should(([$parent]: any) => {
            // Should have only moved 10 px to the top
            expectBbox($parent, {
                top: 90,
                left: 100,
                width: 300,
                height: 300,
            })
        })
        .get("#child")
        .should(([$child]: any) => {
            expectBbox($child, {
                top: 240,
                left: 250,
                width: 600,
                height: 200,
            })
        })
}

describe("Nested drag with constraints", () => {
    it("Parent: layout, Child: layout", () =>
        testNestedDragConstraints(true, true))
    it("Parent: layout", () => testNestedDragConstraints(true, false))
    it("Child: layout", () => testNestedDragConstraints(false, true))
    it("Neither", () => testNestedDragConstraints(false, false))
})

// function testNestedDragConstraints(parentLayout: boolean, childLayout: boolean) {
//     let url = `?test=drag-layout-nested&constraints=true`
//     if (parentLayout) url += `&parentLayout=true`
//     if (childLayout) url += `&childLayout=true`
//     cy.visit(url)
// }

// describe("Nested drag with constraints", () => {
//     it("Parent: layout, Child: layout", () => testNestedDragConstraints(true, true))
//     it("Parent: layout", () => testNestedDragConstraints(true, false))
//     it("Child: layout", () => testNestedDragConstraints(false, true))
//     it("Neither", () => testNestedDragConstraints(false, false))
// })
