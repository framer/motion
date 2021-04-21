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
        .trigger("pointermove", 300, 100, { force: true })
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
    // .wait(20)
    // .get("#parent")
    // .trigger("pointerdown", { clientX: 210, clientY: 200, force: true })
    // .trigger("pointermove", { clientX: 205, clientY: 195, force: true }) // Gesture will start from first move past threshold
    // .wait(50)
    // .trigger("pointermove", { clientX: 110, clientY: 100, force: true })
    // .wait(50)
    // .trigger("pointerup")
    // .should(([$parent]: any) => {
    //     expectBbox($parent, {
    //         top: 90,
    //         left: 100,
    //         width: 300,
    //         height: 300,
    //     })
    // })
    // .get("#child")
    // .should(([$child]: any) => {
    //     expectBbox($child, {
    //         top: 240,
    //         left: 250,
    //         width: 600,
    //         height: 200,
    //     })
    // })
}

describe("Nested drag with constraints", () => {
    it("Parent: layout, Child: layout", () =>
        testNestedDragConstraints(true, true))
    it("Parent: layout", () => testNestedDragConstraints(true, false))
    it("Child: layout", () => testNestedDragConstraints(false, true))
    it("Neither", () => testNestedDragConstraints(false, false))
})

function testNestedDragConstraintsAndAnimation(
    parentLayout: boolean,
    childLayout: boolean
) {
    let url = `?test=drag-layout-nested&constraints=true&animation=true`
    if (parentLayout) url += `&parentLayout=true`
    if (childLayout) url += `&childLayout=true`
    cy.visit(url)
        .get("#parent")
        .trigger("pointerdown", 5, 10)
        .trigger("pointermove", 10, 10) // Gesture will start from first move past threshold
        .wait(50)
        .trigger("pointermove", 200, 10, { force: true })
        .wait(50)
        .should(([$parent]: any) => {
            // Should have only moved 10 px to the top
            expectBbox($parent, {
                top: 100,
                left: 250,
                width: 300,
                height: 300,
            })
        })
        .get("#child")
        .should(([$child]: any) => {
            expectBbox($child, {
                top: 150,
                left: 300,
                width: 600,
                height: 200,
            })
        })
        .get("#parent")
        .trigger("pointerup")
        .wait(2000)
        .should(([$parent]: any) => {
            // Should have only moved 10 px to the top
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
        .get("#child")
        .trigger("pointerdown", 5, 10)
        .trigger("pointermove", 10, 10) // Gesture will start from first move past threshold
        .wait(50)
        .trigger("pointermove", 200, 10, { force: true })
        .wait(70)
        .should(([$child]: any) => {
            expectBbox($child, {
                top: 150,
                left: 400,
                width: 600,
                height: 200,
            })
        })
        .trigger("pointerup")
        .wait(2000)
        .should(([$child]: any) => {
            expectBbox($child, {
                top: 150,
                left: 350,
                width: 600,
                height: 200,
            })
        })
}

function testAlternateAxes(parentLayout: boolean, childLayout: boolean) {
    let url = `?test=drag-layout-nested&bothAxes=true`
    if (parentLayout) url += `&parentLayout=true`
    if (childLayout) url += `&childLayout=true`
    return cy
        .visit(url)
        .wait(50)
        .get("#child")
        .trigger("pointerdown", 5, 5, { force: true })
        .trigger("pointermove", 10, 10, { force: true })
        .wait(50)
        .trigger("pointermove", 100, 100, { force: true })
        .wait(80)
        .should(([$child]: any) => {
            expectBbox($child, {
                top: 240,
                left: 250,
                width: 600,
                height: 200,
            })
        })
        .get("#parent")
        .should(([$parent]: any) => {
            expectBbox($parent, {
                top: 195,
                left: 100,
                width: 300,
                height: 300,
            })
        })
        .wait(30)
        .get("#child")
        .trigger("pointerup", { force: true })
        .wait(80)
        .should(([$child]: any) => {
            expectBbox($child, {
                top: 245,
                left: 250,
                width: 600,
                height: 200,
            })
        })
        .get("#parent")
        .should(([$parent]: any) => {
            expectBbox($parent, {
                top: 195,
                left: 100,
                width: 300,
                height: 300,
            })
        })
}

describe("Nested drag with alternate draggable axes", () => {
    /**
     * Skipping for now as there are still issues when either draggable
     * component is also involved in layout animation
     */
    it.skip("Parent: layout, Child: layout", () =>
        testAlternateAxes(true, true))
    it.skip("Parent: layout", () => testAlternateAxes(true, false))
    it.skip("Child: layout", () => testAlternateAxes(false, true))
    it("Neither", () => testAlternateAxes(false, false))
})

describe("Nested drag with constraints and animation", () => {
    it("Parent: layout, Child: layout", () =>
        testNestedDragConstraintsAndAnimation(true, true))
    it("Parent: layout", () =>
        testNestedDragConstraintsAndAnimation(true, false))
    it("Child: layout", () =>
        testNestedDragConstraintsAndAnimation(false, true))
    it("Neither", () => testNestedDragConstraintsAndAnimation(false, false))
})
