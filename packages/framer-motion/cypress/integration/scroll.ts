describe("scroll()", () => {
    it("Correctly updates window scroll progress callback", () => {
        cy.visit("?test=scroll-callback").wait(100).viewport(100, 400)

        cy.scrollTo(0, 600)
            .wait(200)
            .get("#progress")
            .should(([$element]: any) => {
                expect($element.value).to.equal("0.5")
            })
            .viewport(100, 800)
            .wait(200)
            .should(([$element]: any) => {
                expect($element.value).to.equal("0.25")
            })
    })
})
