describe("animateStyle()", () => {
    it("correctly runs an animation", () => {
        cy.visit("?test=animate-style")
            .wait(200)
            .get("#box")
            .should(([$element]: any) => {
                expect($element.getBoundingClientRect().width).to.equal(200)
                expect($element.style.width).to.equal("200px")
            })
    })

    it("complete() correctly finishes the animation", () => {
        cy.visit("?test=animate-style-complete")
            .wait(200)
            .get("#box")
            .should(([$element]: any) => {
                expect($element.getBoundingClientRect().width).to.equal(200)
                expect($element.style.width).to.equal("200px")
            })
    })

    it("pause() correctly pauses the animation", () => {
        cy.visit("?test=animate-style-pause")
            .wait(200)
            .get("#box")
            .should(([$element]: any) => {
                expect($element.getBoundingClientRect().width).not.to.equal(100)
                expect($element.style.width).to.equal("100px")
            })
    })

    it("autoplay correctly pauses the animation on creation", () => {
        cy.visit("?test=animate-style-autoplay")
            .wait(200)
            .get("#box")
            .should(([$element]: any) => {
                expect($element.getBoundingClientRect().width).not.to.equal(100)
                expect($element.style.width).to.equal("100px")
            })
    })

    it("play correctly resumes the animation", () => {
        cy.visit("?test=animate-style-play")
            .wait(200)
            .get("#box")
            .should(([$element]: any) => {
                expect($element.getBoundingClientRect().width).to.equal(200)
                expect($element.style.width).to.equal("200px")
            })
    })
})
