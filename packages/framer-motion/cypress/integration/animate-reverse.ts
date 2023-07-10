describe("animate() x layout prop in reverse speed", () => {
    it("animate() plays as expected when layout prop is present", () => {
        cy.visit("?test=animate-reverse")
            .wait(1000)
            .get("#action")
            .trigger("click", 1, 1, { force: true })
            .wait(600)
            .get("#result")
            .should(([$element]: any) => {
                expect($element.value).to.equal("Success")
            })
    })
})
