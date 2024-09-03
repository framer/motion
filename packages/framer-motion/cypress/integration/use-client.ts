describe("use client", () => {
    it("Correctly renders motion.div", () => {
        cy.visit("http://localhost:3000").wait(100).get("#test")
    })
})
