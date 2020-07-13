describe("dragging", () => {
    it("doesn't reset drag constraints (ref-based), while dragging, on unrelated parent component updates", () => {
        cy.visit("?test=dragging-ref-constraint")
            .get("[data-testid='draggable']")
            .wait(200)
            .trigger("mousedown", { clientX: 10, clientY: 10 })
            .wait(100)
            .trigger("mousemove", { clientX: 15, clientY: 65 })
            .wait(100)
            .trigger("mousemove", { clientX: 300, clientY: 300 })
            .wait(100)
            .trigger("mouseup", { force: true })
            .should(($draggable: any) => {
                const draggable = $draggable[0] as HTMLDivElement
                const { left, top } = draggable.getBoundingClientRect()

                expect(left).to.equal(150)
                expect(top).to.equal(150)
            })
    })
})
