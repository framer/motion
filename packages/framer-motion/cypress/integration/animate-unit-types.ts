describe("Unit conversion", () => {
    it("animates height: auto correctly", () => {
        cy.visit("?test=animate-height")
            .wait(200)
            .get("#test")
            .should(([$element]: any) => {
                expect($element.innerText).not.to.equal("Error")
            })
    })
})
