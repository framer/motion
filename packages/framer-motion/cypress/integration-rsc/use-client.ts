describe("use client", () => {
    it("Correctly renders components", () => {
        cy.visit("/")
            .wait(100)
            .get("#test")
            .should("exist")
            .get("#m-test")
            .should("exist")
    })
})
