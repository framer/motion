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
                expect(Math.round(top)).to.equal(29)
                expect(Math.round(left)).to.equal(29)
                expect(Math.round(right)).to.equal(171)
                expect(Math.round(bottom)).to.equal(171)
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
                expect(top).to.equal(150)
                expect(left).to.equal(0)
                expect(right).to.equal(200)
                expect(bottom).to.equal(350)
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
                expect(top).to.equal(350)
                expect(left).to.equal(150)
                expect(right).to.equal(250)
                expect(bottom).to.equal(450)
            })
    })
    it("Correctly applies transforms in static mode", () => {
        cy.visit("?test=svg&isStatic=true")
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
                expect(Math.round(top)).to.equal(29)
                expect(Math.round(left)).to.equal(29)
                expect(Math.round(right)).to.equal(171)
                expect(Math.round(bottom)).to.equal(171)
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
                expect(top).to.equal(150)
                expect(left).to.equal(0)
                expect(right).to.equal(200)
                expect(bottom).to.equal(350)
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
                expect(top).to.equal(350)
                expect(left).to.equal(150)
                expect(right).to.equal(250)
                expect(bottom).to.equal(450)
            })
    })
})
