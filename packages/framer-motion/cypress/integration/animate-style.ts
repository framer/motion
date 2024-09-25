describe("animateStyle()", () => {
    it("animateStyle() correctly runs an animation", () => {
        cy.visit("?test=animate-style")
            .wait(200)
            .get("#box")
            .should(([$element]: any) => {
                expect($element.getBoundingClientRect().width).to.equal(200)
                expect($element.style.width).to.equal("200px")
            })
    })
})
