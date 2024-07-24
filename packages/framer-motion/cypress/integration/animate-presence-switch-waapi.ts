describe("AnimatePresence with WAAPI animations", () => {
    it("Interrupting exiting animation doesn't break exit", () => {
        cy.visit("?test=animate-presence-switch-waapi")
            .wait(50)
            .get(".item")
            .should((items: any) => {
                expect(items.length).to.equal(1)
                expect(items[0].textContent).to.equal("0")
            })
            .get("#switch")
            .trigger("click", 10, 10, { force: true })
            .wait(50)
            .get(".item")
            .should((items: any) => {
                expect(items.length).to.equal(2)
                expect(items[0].textContent).to.equal("0")
                expect(items[1].textContent).to.equal("1")
            })
            .wait(200)
            .get(".item")
            .should((items: any) => {
                expect(items.length).to.equal(1)
                expect(items[0].textContent).to.equal("1")
            })
            .get("#switch")
            .trigger("click", 10, 10, { force: true })
            .wait(20)
            .get("#switch")
            .trigger("click", 10, 10, { force: true })
            .wait(20)
            .get("#switch")
            .trigger("click", 10, 10, { force: true })
            .wait(300)
            .get(".item")
            .should((items: any) => {
                expect(items.length).to.equal(1)
            })
        // .wait(50)
        // .get("#b")
        // .should(([$a]: any) => {
        //     expectBbox($a, {
        //         top: 200,
        //         left: 100,
        //         width: 100,
        //         height: 100,
        //     })
        // })
        // .get("#c")
        // .should(([$a]: any) => {
        //     expectBbox($a, {
        //         top: 300,
        //         left: 100,
        //         width: 100,
        //         height: 100,
        //     })
        // })
        // .trigger("click", 60, 60, { force: true })
        // .wait(100)
    })
})
