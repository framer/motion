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

describe("Nested drag", () => {
    it("Parent: layout, Child: layout", () =>
        testNestedDrag("parentLayout=true&childLayout=true"))
    it("Parent: layout", () => testNestedDrag("parentLayout=true"))
    it("Child: layout", () => testNestedDrag("childLayout=true"))

    //   it("Drags the element by the defined distance", () => {
    //       cy.visit("?test=drag")
    //           .get("[data-testid='draggable']")
    //           .wait(200)
    //           .trigger("pointerdown", 5, 5)
    //           .trigger("pointermove", 10, 10) // Gesture will start from first move past threshold
    //           .wait(50)
    //           .trigger("pointermove", 200, 300, { force: true })
    //           .wait(50)
    //           .trigger("pointerup", { force: true })
    //           .should(($draggable: any) => {
    //               const draggable = $draggable[0] as HTMLDivElement
    //               const { left, top } = draggable.getBoundingClientRect()

    //               expect(left).to.equal(200)
    //               expect(top).to.equal(300)
    //           })
    //   })

    //   it("Locks drag to x", () => {
    //       cy.visit("?test=drag&axis=x")
    //           .get("[data-testid='draggable']")
    //           .wait(200)
    //           .trigger("pointerdown", 5, 5)
    //           .wait(50)
    //           .trigger("pointermove", 10, 10) // Gesture will start from first move past threshold
    //           .wait(50)
    //           .trigger("pointermove", 200, 300, { force: true })
    //           .wait(50)
    //           .trigger("pointerup", { force: true })
    //           .should(($draggable: any) => {
    //               const draggable = $draggable[0] as HTMLDivElement
    //               const { left, top } = draggable.getBoundingClientRect()

    //               expect(left).to.equal(200)
    //               expect(top).to.equal(0)
    //           })
    //   })

    //   it("Locks drag to y", () => {
    //       cy.visit("?test=drag&axis=y")
    //           .get("[data-testid='draggable']")
    //           .wait(200)
    //           .trigger("pointerdown", 5, 5)
    //           .trigger("pointermove", 10, 10) // Gesture will start from first move past threshold
    //           .wait(50)
    //           .trigger("pointermove", 200, 300, { force: true })
    //           .wait(50)
    //           .trigger("pointerup", { force: true })
    //           .should(($draggable: any) => {
    //               const draggable = $draggable[0] as HTMLDivElement
    //               const { left, top } = draggable.getBoundingClientRect()

    //               expect(left).to.equal(0)
    //               expect(top).to.equal(300)
    //           })
    //   })

    //   // Having trouble making this test work
    //   // it("Direction locks to x", () => {
    //   //     cy.reload()
    //   //     cy.visit("?test=drag&lock=true")
    //   //         .wait(200)
    //   //         .get("[data-testid='draggable']")
    //   //         .wait(200)
    //   //         .trigger("pointerdown", 5, 5, { force: true })
    //   //         .trigger("pointermove", 5, 5, { force: true }) // Gesture will start from first move past threshold
    //   //         .wait(100)
    //   //         .trigger("pointermove", 200, 10, { force: true })
    //   //         .wait(50)
    //   //         .trigger("pointermove", 10, 200, { force: true })
    //   //         .wait(100)
    //   //         .trigger("pointerup", { force: true })
    //   //         .should(($draggable: any) => {
    //   //             const draggable = $draggable[0] as HTMLDivElement
    //   //             const { left, top } = draggable.getBoundingClientRect()

    //   //             expect(top).to.equal(0)
    //   //             expect(left).to.equal(200)
    //   //         })
    //   // })

    //   it("Direction locks to y", () => {
    //       cy.reload()
    //       cy.visit("?test=drag&lock=true")
    //           .wait(200)
    //           .get("[data-testid='draggable']")
    //           .wait(200)
    //           .trigger("pointerdown", 5, 5, { force: true })
    //           .wait(50)
    //           .trigger("pointermove", 10, 10, { force: true }) // Gesture will start from first move past threshold
    //           .wait(100)
    //           .trigger("pointermove", 10, 200, { force: true })
    //           .wait(100)
    //           .trigger("pointermove", 200, 10, { force: true })
    //           .wait(100)
    //           .trigger("pointerup", { force: true })
    //           .should(($draggable: any) => {
    //               const draggable = $draggable[0] as HTMLDivElement
    //               const { left, top } = draggable.getBoundingClientRect()

    //               expect(left).to.equal(0)
    //               expect(top).to.equal(200)
    //           })
    //   })

    //   it("Constraints as object: bottom right", () => {
    //       cy.visit("?test=drag&right=100&bottom=100")
    //           .wait(200)
    //           .get("[data-testid='draggable']")
    //           .wait(100)
    //           .trigger("pointerdown", 5, 5)
    //           .trigger("pointermove", 10, 10) // Gesture will start from first move past threshold
    //           .wait(50)
    //           .trigger("pointermove", 200, 200, { force: true })
    //           .wait(50)
    //           .trigger("pointerup", { force: true })
    //           .should(($draggable: any) => {
    //               const draggable = $draggable[0] as HTMLDivElement
    //               const { left, top } = draggable.getBoundingClientRect()

    //               expect(left).to.equal(100)
    //               expect(top).to.equal(100)
    //           })
    //   })

    //   it("Constraints as object: top left", () => {
    //       cy.visit("?test=drag&left=-10&top=-10")
    //           .wait(200)
    //           .get("[data-testid='draggable']")
    //           .wait(100)
    //           .trigger("pointerdown", 40, 40)
    //           .trigger("pointermove", 30, 30) // Gesture will start from first move past threshold
    //           .wait(50)
    //           .trigger("pointermove", 10, 10, { force: true })
    //           .wait(50)
    //           .trigger("pointerup", { force: true })
    //           .should(($draggable: any) => {
    //               const draggable = $draggable[0] as HTMLDivElement
    //               const { left, top } = draggable.getBoundingClientRect()

    //               expect(left).to.equal(-10)
    //               expect(top).to.equal(-10)
    //           })
    //   })

    //   it("doesn't reset drag constraints (ref-based), while dragging, on unrelated parent component updates", () => {
    //       cy.visit("?test=drag-ref-constraints")
    //           .wait(200)
    //           .get("[data-testid='draggable']")
    //           .trigger("pointerdown", 10, 10)
    //           .trigger("pointermove", 15, 15)
    //           .wait(50)
    //           .trigger("pointermove", 300, 300, { force: true })
    //           .wait(50)
    //           .trigger("pointerup", { force: true })
    //           .should(($draggable: any) => {
    //               const draggable = $draggable[0] as HTMLDivElement
    //               const { left, top } = draggable.getBoundingClientRect()

    //               expect(left).to.equal(150)
    //               expect(top).to.equal(150)
    //           })
    //   })
    // })

    // describe("Drag & Layout", () => {
    //   it("Drags the element by the defined distance", () => {
    //       cy.visit("?test=drag&layout=true")
    //           .get("[data-testid='draggable']")
    //           .wait(200)
    //           .trigger("pointerdown", 5, 5)
    //           .trigger("pointermove", 10, 10) // Gesture will start from first move past threshold
    //           .wait(50)
    //           .trigger("pointermove", 200, 300, { force: true })
    //           .wait(50)
    //           .trigger("pointerup", { force: true })
    //           .should(($draggable: any) => {
    //               const draggable = $draggable[0] as HTMLDivElement
    //               const { left, top } = draggable.getBoundingClientRect()

    //               expect(left).to.equal(190)
    //               expect(top).to.equal(290)
    //           })
    //   })

    //   it("Locks drag to x", () => {
    //       cy.visit("?test=drag&axis=x&layout=true")
    //           .get("[data-testid='draggable']")
    //           .wait(200)
    //           .trigger("pointerdown", 5, 5)
    //           .trigger("pointermove", 10, 10) // Gesture will start from first move past threshold
    //           .wait(50)
    //           .trigger("pointermove", 200, 300, { force: true })
    //           .wait(50)
    //           .trigger("pointerup", { force: true })
    //           .should(($draggable: any) => {
    //               const draggable = $draggable[0] as HTMLDivElement
    //               const { left, top } = draggable.getBoundingClientRect()

    //               expect(left).to.equal(190)
    //               expect(top).to.equal(0)
    //           })
    //   })

    //   it("Locks drag to y", () => {
    //       cy.visit("?test=drag&axis=y&layout=true")
    //           .get("[data-testid='draggable']")
    //           .wait(200)
    //           .trigger("pointerdown", 5, 5)
    //           .trigger("pointermove", 10, 10) // Gesture will start from first move past threshold
    //           .wait(50)
    //           .trigger("pointermove", 200, 300, { force: true })
    //           .wait(50)
    //           .trigger("pointerup", { force: true })
    //           .should(($draggable: any) => {
    //               const draggable = $draggable[0] as HTMLDivElement
    //               const { left, top } = draggable.getBoundingClientRect()

    //               expect(left).to.equal(0)
    //               expect(top).to.equal(290)
    //           })
    //   })

    //   // Having trouble making this test work
    //   // it("Direction locks to x", () => {
    //   //     cy.reload()
    //   //     cy.visit("?test=drag&lock=true&layout=true")
    //   //         .wait(100)
    //   //         .get("[data-testid='draggable']")
    //   //         .wait(200)
    //   //         .trigger("pointerdown", 5, 5, { force: true })
    //   //         .wait(50)
    //   //         .trigger("pointermove", 5, 5, { force: true }) // Gesture will start from first move past threshold
    //   //         .wait(100)
    //   //         .trigger("pointermove", 200, 10, { force: true })
    //   //         .wait(50)
    //   //         .trigger("pointermove", 10, 200, { force: true })
    //   //         .wait(100)
    //   //         .trigger("pointerup", { force: true })
    //   //         .should(($draggable: any) => {
    //   //             const draggable = $draggable[0] as HTMLDivElement
    //   //             const { left, top } = draggable.getBoundingClientRect()

    //   //             expect(left).to.equal(190)
    //   //             expect(top).to.equal(0)
    //   //         })
    //   // })

    //   it("Direction locks to y", () => {
    //       cy.visit("?test=drag&lock=true&layout=true")
    //           .wait(100)
    //           .get("[data-testid='draggable']")
    //           .wait(200)
    //           .trigger("pointerdown", 5, 5, { force: true })
    //           .trigger("pointermove", 10, 10, { force: true }) // Gesture will start from first move past threshold
    //           .wait(100)
    //           .trigger("pointermove", 10, 200, { force: true })
    //           .wait(100)
    //           .trigger("pointermove", 200, 10, { force: true })
    //           .wait(100)
    //           .trigger("pointerup", { force: true })
    //           .should(($draggable: any) => {
    //               const draggable = $draggable[0] as HTMLDivElement
    //               const { left, top } = draggable.getBoundingClientRect()

    //               expect(left).to.equal(0)
    //               expect(top).to.equal(190)
    //           })
    //   })

    //   it("Constraints as object: bottom right", () => {
    //       cy.visit("?test=drag&right=100&bottom=100&layout=true")
    //           .wait(200)
    //           .get("[data-testid='draggable']")
    //           .trigger("pointerdown", 5, 5)
    //           .trigger("pointermove", 10, 10) // Gesture will start from first move past threshold
    //           .wait(50)
    //           .trigger("pointermove", 200, 200, { force: true })
    //           .wait(50)
    //           .trigger("pointerup", { force: true })
    //           .should(($draggable: any) => {
    //               const draggable = $draggable[0] as HTMLDivElement
    //               const { left, top } = draggable.getBoundingClientRect()

    //               expect(left).to.equal(100)
    //               expect(top).to.equal(100)
    //           })
    //   })

    //   it("Constraints as object: top left", () => {
    //       cy.visit("?test=drag&left=-10&top=-10&layout=true")
    //           .wait(200)
    //           .get("[data-testid='draggable']")
    //           .trigger("pointerdown", 40, 40)
    //           .trigger("pointermove", 30, 30) // Gesture will start from first move past threshold
    //           .wait(50)
    //           .trigger("pointermove", 10, 10, { force: true })
    //           .wait(50)
    //           .trigger("pointerup", { force: true })
    //           .should(($draggable: any) => {
    //               const draggable = $draggable[0] as HTMLDivElement
    //               const { left, top } = draggable.getBoundingClientRect()

    //               expect(left).to.equal(-10)
    //               expect(top).to.equal(-10)
    //           })
    //   })

    //   it("doesn't reset drag constraints (ref-based), while dragging, on unrelated parent component updates", () => {
    //       cy.visit("?test=drag-ref-constraints&layout=true")
    //           .wait(200)
    //           .get("[data-testid='draggable']")
    //           .trigger("pointerdown", 10, 10)
    //           .trigger("pointermove", 15, 15)
    //           .wait(50)
    //           .trigger("pointermove", 300, 300, { force: true })
    //           .wait(50)
    //           .trigger("pointerup", { force: true })
    //           .should(($draggable: any) => {
    //               const draggable = $draggable[0] as HTMLDivElement
    //               const { left, top } = draggable.getBoundingClientRect()

    //               expect(left).to.equal(150)
    //               expect(top).to.equal(150)
    //           })
    //   })
})
