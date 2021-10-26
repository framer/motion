describe("Cancelled Animation", () => {
    it("Allows the animation to be marked complete", () => {
        cy.visit("?test=layout-cancelled-finishes")
            .get("[data-testid='cancellable']")
            .trigger("click")
            .wait(200)
            .should(($cancellable: any) => {
                const cancellable = $cancellable[0] as HTMLDivElement
                expect(cancellable).to.not.exist
            })
    })
})
