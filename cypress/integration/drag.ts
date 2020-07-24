describe("Drag", () => {
    it("Drags the element by the defined distance", () => {
        cy.visit("?test=drag")
            .get("[data-testid='draggable']")
            .wait(200)
            .trigger("pointerdown", 5, 5)
            .trigger("pointermove", 10, 10) // Gesture will start from first move past threshold
            .wait(50)
            .trigger("pointermove", 200, 300, { force: true })
            .wait(50)
            .trigger("pointerup", { force: true })
            .should(($draggable: any) => {
                const draggable = $draggable[0] as HTMLDivElement
                const { left, top } = draggable.getBoundingClientRect()

                expect(left).to.equal(190)
                expect(top).to.equal(290)
            })
    })

    it("Locks drag to x", () => {
        cy.visit("?test=drag&axis=x")
            .get("[data-testid='draggable']")
            .wait(200)
            .trigger("pointerdown", 5, 5)
            .trigger("pointermove", 10, 10) // Gesture will start from first move past threshold
            .wait(50)
            .trigger("pointermove", 200, 300, { force: true })
            .wait(50)
            .trigger("pointerup", { force: true })
            .should(($draggable: any) => {
                const draggable = $draggable[0] as HTMLDivElement
                const { left, top } = draggable.getBoundingClientRect()

                expect(left).to.equal(190)
                expect(top).to.equal(0)
            })
    })

    it("Locks drag to y", () => {
        cy.visit("?test=drag&axis=y")
            .get("[data-testid='draggable']")
            .wait(200)
            .trigger("pointerdown", 5, 5)
            .trigger("pointermove", 10, 10) // Gesture will start from first move past threshold
            .wait(50)
            .trigger("pointermove", 200, 300, { force: true })
            .wait(50)
            .trigger("pointerup", { force: true })
            .should(($draggable: any) => {
                const draggable = $draggable[0] as HTMLDivElement
                const { left, top } = draggable.getBoundingClientRect()

                expect(left).to.equal(0)
                expect(top).to.equal(290)
            })
    })

    it("Direction locks to x", () => {
        cy.visit("?test=drag&lock=true")
            .wait(100)
            .get("[data-testid='draggable']")
            .wait(200)
            .trigger("pointerdown", 5, 5)
            .trigger("pointermove", 10, 10) // Gesture will start from first move past threshold
            .wait(100)
            .trigger("pointermove", 200, 10, { force: true })
            .wait(50)
            .trigger("pointermove", 10, 200, { force: true })
            .wait(100)
            .trigger("pointerup", { force: true })
            .should(($draggable: any) => {
                const draggable = $draggable[0] as HTMLDivElement
                const { left, top } = draggable.getBoundingClientRect()

                expect(left).to.equal(190)
                expect(top).to.equal(0)
            })
    })

    it("Direction locks to y", () => {
        cy.visit("?test=drag&lock=true")
            .wait(100)
            .get("[data-testid='draggable']")
            .wait(200)
            .trigger("pointerdown", 5, 5)
            .trigger("pointermove", 10, 10) // Gesture will start from first move past threshold
            .wait(100)
            .trigger("pointermove", 10, 200, { force: true })
            .wait(100)
            .trigger("pointermove", 200, 10, { force: true })
            .wait(100)
            .trigger("pointerup", { force: true })
            .should(($draggable: any) => {
                const draggable = $draggable[0] as HTMLDivElement
                const { left, top } = draggable.getBoundingClientRect()

                expect(left).to.equal(0)
                expect(top).to.equal(190)
            })
    })

    it("Constraints as object: bottom right", () => {
        cy.visit("?test=drag&right=100&bottom=100")
            .wait(200)
            .get("[data-testid='draggable']")
            .trigger("pointerdown", 5, 5)
            .trigger("pointermove", 10, 10) // Gesture will start from first move past threshold
            .wait(50)
            .trigger("pointermove", 200, 200, { force: true })
            .wait(50)
            .trigger("pointerup", { force: true })
            .should(($draggable: any) => {
                const draggable = $draggable[0] as HTMLDivElement
                const { left, top } = draggable.getBoundingClientRect()

                expect(left).to.equal(50)
                expect(top).to.equal(50)
            })
    })

    it("Constraints as object: top left", () => {
        cy.visit("?test=drag&left=-10&top=-10")
            .wait(200)
            .get("[data-testid='draggable']")
            .trigger("pointerdown", 40, 40)
            .trigger("pointermove", 30, 30) // Gesture will start from first move past threshold
            .wait(50)
            .trigger("pointermove", 10, 10, { force: true })
            .wait(50)
            .trigger("pointerup", { force: true })
            .should(($draggable: any) => {
                const draggable = $draggable[0] as HTMLDivElement
                const { left, top } = draggable.getBoundingClientRect()

                expect(left).to.equal(-10)
                expect(top).to.equal(-10)
            })
    })

    it("doesn't reset drag constraints (ref-based), while dragging, on unrelated parent component updates", () => {
        cy.visit("?test=drag-ref-constraints")
            .wait(200)
            .get("[data-testid='draggable']")
            .trigger("pointerdown", 10, 10)
            .trigger("pointermove", 15, 15)
            .wait(50)
            .trigger("pointermove", 300, 300, { force: true })
            .wait(50)
            .trigger("pointerup", { force: true })
            .should(($draggable: any) => {
                const draggable = $draggable[0] as HTMLDivElement
                const { left, top } = draggable.getBoundingClientRect()

                expect(left).to.equal(150)
                expect(top).to.equal(150)
            })
    })
})
