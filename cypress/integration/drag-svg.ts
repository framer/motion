describe("Drag SVG", () => {
    it("Drags the element by the defined distance", () => {
        cy.visit("?test=drag-svg")
            .get("[data-testid='draggable']")
            .wait(200)
            .trigger("pointerdown", 0, 0, { force: true })
            .trigger("pointermove", 60, 60, { force: true }) // Gesture will start from first move past threshold
            .wait(50)
            .trigger("pointermove", 200, 300, { force: true })
            .wait(50)
            .trigger("pointerup", { force: true })
            .should(($draggable: any) => {
                const draggable = $draggable[0] as HTMLDivElement
                const { left, top } = draggable.getBoundingClientRect()

                expect(left).to.equal(170)
                expect(top).to.equal(270)
            })
    })

    it("Locks drag to x", () => {
        cy.visit("?test=drag-svg&axis=x")
            .get("[data-testid='draggable']")
            .wait(200)
            .trigger("pointerdown", 50, 50, { force: true })
            .trigger("pointermove", 60, 60, { force: true }) // Gesture will start from first move past threshold
            .wait(50)
            .trigger("pointermove", 200, 300, { force: true })
            .wait(50)
            .trigger("pointerup", { force: true })
            .should(($draggable: any) => {
                const draggable = $draggable[0] as HTMLDivElement
                const { left, top } = draggable.getBoundingClientRect()

                expect(left).to.equal(170)
                expect(top).to.equal(30)
            })
    })

    it("Locks drag to y", () => {
        cy.visit("?test=drag-svg&axis=y")
            .get("[data-testid='draggable']")
            .wait(200)
            .trigger("pointerdown", 50, 50, { force: true })
            .trigger("pointermove", 60, 60, { force: true }) // Gesture will start from first move past threshold
            .wait(50)
            .trigger("pointermove", 200, 300, { force: true })
            .wait(50)
            .trigger("pointerup", { force: true })
            .should(($draggable: any) => {
                const draggable = $draggable[0] as HTMLDivElement
                const { left, top } = draggable.getBoundingClientRect()

                expect(left).to.equal(30)
                expect(top).to.equal(270)
            })
    })

    // TODO: Figure out direction lock tests in Cypress
    // it("Direction locks to x", () => {
    //     cy.visit("?test=drag-svg&lock=true")
    //         .wait(200)
    //         .get("[data-testid='draggable']")
    //         .trigger("pointerdown", 50, 50, { force: true })

    //     cy.window()
    //         .trigger("pointermove", 60, 50, { force: true }) // Gesture will start from first move past threshold
    //         .wait(100)
    //         .trigger("pointermove", 200, 0, { force: true })
    //         .wait(50)
    //         // .trigger("pointermove", 200, 200, { force: true })
    //         // .wait(50)
    //         .trigger("pointerup", { force: true })
    //     cy.get("[data-testid='draggable']").should(($draggable: any) => {
    //         const draggable = $draggable[0] as HTMLDivElement
    //         const { left, top } = draggable.getBoundingClientRect()

    //         expect(left).to.equal(170)
    //         expect(top).to.equal(30)
    //     })
    // })

    // it("Direction locks to y", () => {
    //     cy.visit("?test=drag-svg&lock=true")
    //         .get("[data-testid='draggable']")
    //         .wait(200)
    //         .trigger("pointerdown", 50, 50, { force: true })
    //         .trigger("pointermove", 50, 60, { force: true }) // Gesture will start from first move past threshold
    //         .wait(200)
    //         .trigger("pointermove", 50, 200, { force: true })
    //         .wait(50)
    //         .trigger("pointermove", 200, 50, { force: true })
    //         .wait(50)
    //         .trigger("pointerup", { force: true })
    //         .should(($draggable: any) => {
    //             const draggable = $draggable[0] as HTMLDivElement
    //             const { left, top } = draggable.getBoundingClientRect()

    //             expect(left).to.equal(30)
    //             expect(top).to.equal(270)
    //         })
    // })

    it("Constraints as object: bottom right", () => {
        cy.visit("?test=drag-svg&right=100&bottom=100")
            .wait(200)
            .get("[data-testid='draggable']")
            .trigger("pointerdown", 50, 50, { force: true })
            .trigger("pointermove", 60, 60, { force: true }) // Gesture will start from first move past threshold
            .wait(50)
            .trigger("pointermove", 200, 200, { force: true })
            .wait(50)
            .trigger("pointerup", { force: true })
            .should(($draggable: any) => {
                const draggable = $draggable[0] as HTMLDivElement
                const { left, top } = draggable.getBoundingClientRect()

                expect(left).to.equal(90)
                expect(top).to.equal(90)
            })
    })

    it("Constraints as object: top left", () => {
        cy.visit("?test=drag-svg&left=-10&top=-10")
            .wait(200)
            .get("[data-testid='draggable']")
            .trigger("pointerdown", 50, 50, { force: true })
            .trigger("pointermove", 60, 60, { force: true }) // Gesture will start from first move past threshold
            .wait(50)
            .trigger("pointermove", 10, 10, { force: true })
            .wait(50)
            .trigger("pointerup", { force: true })
            .should(($draggable: any) => {
                const draggable = $draggable[0] as HTMLDivElement
                const { left, top } = draggable.getBoundingClientRect()

                expect(left).to.equal(20)
                expect(top).to.equal(20)
            })
    })
})
