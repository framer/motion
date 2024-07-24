describe("CSS variables", () => {
    it("Numerical CSS var values are resolved and animated correctly", () => {
        cy.visit("?test=css-vars")
            .wait(100)
            .get("#test")
            .should(([$element]: any) => {
                expect($element.textContent).to.equal("Success")
            })
    })

    it("CSS vars are set as value at the end of an animation", () => {
        cy.visit("?test=css-vars")
            .wait(200)
            .get("#test")
            .should(([$element]: any) => {
                expect($element.style.backgroundColor).to.equal("var(--a)")
                expect($element.style.opacity).to.equal("var(--d)")
            })
    })
})
