describe("SVG", () => {
    it("Correctly applies transforms", () => {
        cy.visit("?test=svg")
            .wait(200)
            .get("[data-testid='rotate']")
            .should(($rotate: any) => {
                const rotate = $rotate[0] as SVGRectElement
                const {
                    top,
                    left,
                    right,
                    bottom,
                } = rotate.getBoundingClientRect()
                expect(Math.round(top)).to.equal(79)
                expect(Math.round(left)).to.equal(79)
                expect(Math.round(right)).to.equal(221)
                expect(Math.round(bottom)).to.equal(221)
            })
            .get("[data-testid='scale']")
            .should(($scale: any) => {
                const scale = $scale[0] as SVGRectElement
                const {
                    top,
                    left,
                    right,
                    bottom,
                } = scale.getBoundingClientRect()
                expect(top).to.equal(350)
                expect(left).to.equal(50)
                expect(right).to.equal(250)
                expect(bottom).to.equal(550)
            })
            .get("[data-testid='translate']")
            .should(($translate: any) => {
                const translate = $translate[0] as SVGRectElement
                const {
                    top,
                    left,
                    right,
                    bottom,
                } = translate.getBoundingClientRect()
                expect(top).to.equal(700)
                expect(left).to.equal(150)
                expect(right).to.equal(250)
                expect(bottom).to.equal(800)
            })
    })
})
