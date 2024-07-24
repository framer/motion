describe("Tabs demo", () => {
    it("Layout animations don't interfere with opacity", () => {
        cy.visit("?test=drag-tabs")
            .get("button.add-item")
            .wait(50)
            .click()
            .wait(100)
            .get("#Carrot-tab")
            .should(([$tab]: any) => {
                expect(window.getComputedStyle($tab).opacity).to.equal("1")
            })
    })

    it("First tab doesn't distort when multiple layout animations started", () => {
        cy.visit("?test=drag-tabs")
            .wait(50)
            .get("#Tomato-label")
            .should(([$label]: any) => {
                const { left, right } = $label.getBoundingClientRect()
                expect(left).to.equal(280)
                expect(right).to.equal(390)
            })
            .get("button.add-item")
            .click()
            .wait(20)
            .click()
            .wait(100)
            .get("#Tomato-label")
            .should(([$label]: any) => {
                const { left, right } = $label.getBoundingClientRect()
                expect(left).to.equal(280)
                expect(right).to.equal(334)
            })
    })

    it("Opacity finishes animating on reorder", () => {
        cy.visit("?test=drag-tabs")
            .get("#Lettuce-tab")
            .wait(50)
            .click()
            .trigger("pointerdown", 40, 10)
            .wait(300)
            .trigger("pointermove", -40, 10, { force: true }) // Gesture will start from first move past threshold
            .trigger("pointermove", -100, 300, { force: true })
            .wait(50)
            .trigger("pointerup", { force: true })
            .wait(200)
            .get("#Lettuce-content")
            .should(([$content]: any) => {
                expect(window.getComputedStyle($content).opacity).to.equal("1")
            })
            .get("#Tomato-tab")
            .wait(200)
            .trigger("pointerdown", 40, 10)
            .trigger("pointermove", -40, 10, { force: true }) // Gesture will start from first move past threshold
            .wait(20)
            .trigger("pointermove", -100, 300, { force: true })
            .wait(100)
            .trigger("pointerup", { force: true })
            .wait(350)
            .should(([$tab]: any) => {
                const { left } = $tab.getBoundingClientRect()
                expect(left).to.equal(265)
            })
            .get("#Tomato-label")
            .should(([$label]: any) => {
                const { left } = $label.getBoundingClientRect()
                expect(left).to.equal(280)
            })
    })

    it("Double removing item doesn't break exit animation", () => {
        cy.visit("?test=drag-tabs")
            .wait(50)
            .get("#Lettuce-remove")
            .click()
            .wait(20)
            .click()
            .get("nav")
            .wait(400)
            .should(([$tabs]: any) => {
                const lettuce = $tabs.querySelectorAll("#Lettuce-tab")
                expect(lettuce.length).to.equal(0)
            })
    })

    it("Removed tabs don't reappear on reorder", () => {
        cy.visit("?test=drag-tabs")
            .get("#Tomato-remove")
            .click()
            .wait(400)
            .get("#Lettuce-tab")
            .trigger("pointerdown", 40, 10)
            .wait(30)
            .trigger("pointermove", 50, 10, { force: true }) // Gesture will start from first move past threshold
            .wait(40)
            .trigger("pointermove", 200, 10, { force: true })
            .wait(100)
            .trigger("pointerup", { force: true })
            .wait(200)
            .should(([$tab]: any) => {
                const { left, right } = $tab.getBoundingClientRect()
                expect(left).to.equal(475)
                expect(right).to.equal(685)
            })
            .get("nav")
            .should(([$nav]: any) => {
                expect($nav.querySelectorAll(".tab").length).to.equal(2)
            })
    })

    it("New items correctly reorderable", () => {
        cy.visit("?test=drag-tabs")
            .get("button.add-item")
            .wait(50)
            .click()
            .wait(150)
            .get("#Carrot-tab")
            .wait(50)
            .trigger("pointerdown", 40, 10)
            .wait(30)
            .trigger("pointermove", -40, 10, { force: true }) // Gesture will start from first move past threshold
            .wait(100)
            .trigger("pointermove", -10, 10, { force: true })
            .wait(100)
            .trigger("pointerup", { force: true })
            .wait(200)
            .should(([$label]: any) => {
                const { left } = $label.getBoundingClientRect()
                expect(left).to.equal(475)
            })
    })
})
