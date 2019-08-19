describe("dragging", () => {
    it("doesn't reset drag constraints (ref-based), while dragging, on unrelated parent component updates", () => {
        cy.visit("?test=dragging-ref-constraint")
            .get("[data-testid='draggable']")
            .wait(200)
            .trigger("pointerdown")
            .wait(100)
            .trigger("pointermove", { pageX: 5, pageY: 55 })
            .wait(100)
            .trigger("pointermove", { pageX: 300, pageY: 300 })
            .wait(100)
            .trigger("pointerup", { force: true })
            .should(($draggable: any) => {
                const draggable = $draggable[0] as HTMLDivElement
                const { left, top } = draggable.getBoundingClientRect()

                expect(left).to.equal(150)
                expect(top).to.equal(150)
            })
    })
})
