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

    it("Animate x from 0 to calc with externally-defined motion value", () => {
        cy.visit("?test=unit-conversion&use-motion-value=true")
            .wait(100)
            .get("#box")
            .trigger("click")
            .wait(100)
            .should(([$box]: any) => {
                const { left } = $box.getBoundingClientRect()
                expect(left).to.equal(150)
            })
    })

    it("Animate width and height to/from vh units", () => {
        cy.viewport(400, 400)
            .visit("?test=unit-conversion-vh")
            .wait(100)
            .get("#box")
            .should(([$box]: any) => {
                const { width, height } = $box.getBoundingClientRect()
                expect(width).to.equal(150)
                expect(height).to.equal(150)
            })
    })

    it("Restores unapplied transforms", () => {
        cy.viewport(400, 400)
            .visit("?test=unit-conversion-rotate")
            .wait(300)
            .get("#box")
            .should(([$box]: any) => {
                const { transform } = $box.style
                expect(transform).to.equal("rotate(45deg)")
                expect($box.textContent).to.equal("Success")
            })
    })

    it("Coerces none keyframes before measuring", () => {
        cy.viewport(400, 400)
            .visit("?test=unit-conversion-to-zero")
            .wait(100)
            .get("#box")
            .should(([$box]: any) => {
                const { top } = $box.getBoundingClientRect()
                expect(top).to.equal(100)
            })
    })
})
