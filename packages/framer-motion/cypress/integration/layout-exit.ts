describe("Layout exit animations", () => {
    it("Allows the animation to be marked complete", () => {
        cy.visit("?test=layout-exit")
            .get("#box")
            .trigger("click")
            .wait(500)
            .should(($box: any) => {
                const box = $box[0] as HTMLDivElement
                expect(box).to.not.exist
            })
    })
})
