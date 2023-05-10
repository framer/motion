describe("AnimatePresence", () => {
    it("Ensures all elements are removed", () => {
        cy.visit("?test=animate-presence-remove")
            .wait(50)
            .get("#remove")
            .trigger("click", 1, 1, { force: true })
            .wait(100)
            .trigger("click", 1, 1, { force: true })
            .wait(700)
            .get(".box")
            .should((results) => {
                expect(results.length).to.equal(1)
            })
    })
})
