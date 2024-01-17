describe("waapi", () => {
    it("Cancelled animations should be able to complete", () => {
        cy.visit("?test=waapi-cancel")
            .wait(100)
            .get("#box")
            .should(([$element]: any) => {
                expect(getComputedStyle($element).opacity).to.equal("0")
            })
    })
})
