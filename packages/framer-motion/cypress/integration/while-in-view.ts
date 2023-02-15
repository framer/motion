describe("whileInView", () => {
    it("Animates when an element enters the viewport", () => {
        cy.visit("?test=while-in-view")
            .wait(50)
            .get("#box")
            .should(([$element]: any) => {
                expect($element.style.backgroundColor).to.equal(
                    "rgb(255, 0, 0)"
                )
                expect($element.innerHTML).to.equal("Out")
            })

        cy.scrollTo(0, 50)
            .wait(50)
            .get("#box")
            .should(([$element]: any) => {
                expect($element.style.backgroundColor).to.equal(
                    "rgb(0, 255, 0)"
                )
                expect($element.innerHTML).to.equal("In")
            })
    })

    it("Animates when an element leaves the viewport", () => {
        cy.visit("?test=while-in-view")
            .wait(50)
            .scrollTo(0, 0)
            .wait(50)
            .get("#box")
            .should(([$element]: any) => {
                expect($element.style.backgroundColor).to.equal(
                    "rgb(255, 0, 0)"
                )
                expect($element.innerHTML).to.equal("Out")
            })
    })

    it("Animates only when all an element enters the viewport and amount='all'", () => {
        cy.visit("?test=while-in-view&amount=all")
            .wait(50)
            .get("#box")
            .should(([$element]: any) => {
                expect($element.style.backgroundColor).to.equal(
                    "rgb(255, 0, 0)"
                )
            })

        cy.scrollTo(0, 50)
            .wait(50)
            .get("#box")
            .should(([$element]: any) => {
                expect($element.style.backgroundColor).to.equal(
                    "rgb(255, 0, 0)"
                )
            })

        cy.scrollTo(0, 150)
            .wait(50)
            .get("#box")
            .should(([$element]: any) => {
                expect($element.style.backgroundColor).to.equal(
                    "rgb(0, 255, 0)"
                )
            })
    })

    it("Animates when an element enters the viewport once", () => {
        cy.visit("?test=while-in-view&once=true")
            .wait(50)
            .get("#box")
            .should(([$element]: any) => {
                expect($element.style.backgroundColor).to.equal(
                    "rgb(255, 0, 0)"
                )
                expect($element.innerHTML).to.equal("Out")
            })

        cy.scrollTo(0, 50)
            .wait(50)
            .get("#box")
            .should(([$element]: any) => {
                expect($element.style.backgroundColor).to.equal(
                    "rgb(0, 255, 0)"
                )
                expect($element.innerHTML).to.equal("In")
            })

        cy.scrollTo(0, 0)
            .wait(50)
            .get("#box")
            .should(([$element]: any) => {
                expect($element.style.backgroundColor).to.equal(
                    "rgb(0, 255, 0)"
                )
                expect($element.innerHTML).to.equal("In")
            })
    })

    it("Animates when entering a custom root", () => {
        cy.visit("?test=while-in-view-custom-root")
            .wait(50)
            .get("#box")
            .should(([$element]: any) => {
                expect($element.style.backgroundColor).to.equal(
                    "rgb(255, 0, 0)"
                )
            })
            .get("#container")
            .scrollTo(500, 0)
            .wait(50)
            .get("#box")
            .should(([$element]: any) => {
                expect($element.style.backgroundColor).to.equal(
                    "rgb(0, 255, 0)"
                )
            })
            .get("#container")
            .scrollTo(0, 0)
            .wait(50)
            .get("#box")
            .should(([$element]: any) => {
                expect($element.style.backgroundColor).to.equal(
                    "rgb(255, 0, 0)"
                )
            })
    })

    /**
     * Manually verified this does work but headless browser not respecting margin
     */
    it.skip("Respects margin", () => {
        cy.visit("?test=while-in-view&margin=100px")
            .wait(100)
            .get("#box")
            .should(([$element]: any) => {
                expect($element.style.backgroundColor).to.equal(
                    "rgb(0, 255, 0)"
                )
                expect($element.innerHTML).to.equal("In")
            })
    })
})
