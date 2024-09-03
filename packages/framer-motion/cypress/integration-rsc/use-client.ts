describe("use client", () => {
    it("Correctly renders motion.div", () => {
        cy.visit("/").wait(100).get("#test")
    })
})
