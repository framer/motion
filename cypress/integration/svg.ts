describe("SVG", () => {
    it("Correctly applies transforms", () => {
        cy.visit("?test=svg")
            .wait(200)
            .get("[data-testid='scale']")
            .should(($scale: any) => {
                const scale = $scale[0] as SVGRectElement
                const { left, top } = scale.getBBox()

                expect(left).to.equal(200)
                expect(top).to.equal(300)
            })
            .get("[data-testid='rotate']")
            .should(($rotate: any) => {
                const rotate = $rotate[0] as SVGRectElement
                const { left, top } = rotate.getBBox()

                expect(left).to.equal(200)
                expect(top).to.equal(300)
            })
            .get("[data-testid='translate']")
            .should(($translate: any) => {
                const translate = $translate[0] as SVGRectElement
                const { left, top } = translate.getBBox()

                expect(left).to.equal(200)
                expect(top).to.equal(300)
            })
    })
})
