describe("scroll()", () => {
    it("Fires callback on first frame, before scroll event", () => {
        cy.visit("?test=scroll-callback-first-frame")
            .wait(100)
            .get("#progress")
            .should(([$element]: any) => {
                expect($element.innerText).to.equal("2")
            })
    })

    it("Correctly updates window scroll progress callback", () => {
        cy.visit("?test=scroll-callback-window").wait(100).viewport(100, 400)

        cy.scrollTo(0, 600)
            .wait(200)
            .get("#progress")
            .should(([$element]: any) => {
                expect($element.innerText).to.equal("0.5")
            })
        cy.viewport(100, 800)
            .wait(200)
            .get("#progress")
            .should(([$element]: any) => {
                expect($element.innerText).to.equal("0.25")
            })
    })

    it("Correctly updates window scroll progress callback, x axis", () => {
        cy.visit("?test=scroll-callback-window-x").wait(100).viewport(400, 100)

        cy.scrollTo(600, 0)
            .wait(200)
            .get("#progress")
            .should(([$element]: any) => {
                expect($element.innerText).to.equal("0.5")
            })
        cy.viewport(800, 100)
            .wait(200)
            .get("#progress")
            .should(([$element]: any) => {
                expect($element.innerText).to.equal("0.25")
            })
    })

    it("Correctly updates element scroll progress callback", () => {
        cy.visit("?test=scroll-callback-element").wait(100)

        cy.get("#scroller")
            .scrollTo(0, 600)
            .wait(200)
            .get("#progress")
            .should(([$element]: any) => {
                const progress = parseFloat($element.innerText)
                const isClose = progress >= 0.49 && progress <= 0.51
                expect(isClose).to.equal(true)
            })
    })

    it("Correctly updates element scroll progress callback, x axis", () => {
        cy.visit("?test=scroll-callback-element-x").wait(100)

        cy.get("#scroller")
            .scrollTo(600, 0)
            .wait(200)
            .get("#progress")
            .should(([$element]: any) => {
                const progress = parseFloat($element.innerText)
                const isClose = progress >= 0.49 && progress <= 0.51
                expect(isClose).to.equal(true)
            })
    })
})
