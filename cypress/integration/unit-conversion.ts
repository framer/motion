describe("Unit conversion", () => {
    it("Animate x from 0 to calc", () => {
        cy.visit("?test=unit-conversion")
            .wait(100)
            .get("#box")
            .trigger("click")
            .wait(100)
            .should(([$box]: any) => {
                const { left } = $box.getBoundingClientRect()
                expect(left).to.equal(150)
            })
    })
})
