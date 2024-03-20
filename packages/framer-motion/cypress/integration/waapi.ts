describe("waapi", () => {
    it("Cancelled animations should be able to complete", () => {
        cy.visit("?test=waapi-cancel")
            .wait(100)
            .get("#box")
            .should(([$element]: any) => {
                expect(getComputedStyle($element).opacity).to.equal("1")
                expect($element.getBoundingClientRect().left).to.equal(200)
            })
    })

    it("Animations are correctly interrupted", () => {
        cy.visit("?test=waapi-interrupt")
            .wait(200)
            .get("#box")
            .should(([$element]: any) => {
                expect(getComputedStyle($element).opacity).not.to.equal("1")
                expect($element.getBoundingClientRect().width).not.to.equal(100)
            })
            .trigger("click", 250, 250, { force: true })
            .wait(200)
            .should(([$element]: any) => {
                expect(getComputedStyle($element).opacity).not.to.equal("1")
                expect($element.getBoundingClientRect().width).not.to.equal(100)
            })
    })
})
