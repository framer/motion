describe("AnimatePresence: exit completes during a transition render", () => {
    for (const mode of ["sync", "popLayout"]) {
        for (const transition of ["start", "use"]) {
            it(`renders the child added by the transition (${mode}, ${transition})`, () => {
                cy.visit(
                    `?test=animate-presence-transition-exit&mode=${mode}&transition=${transition}`
                )
                    .wait(200)
                    .get("#remove")
                    .click()
                    .wait(100)
                    .get("#add")
                    .click()
                    .get("#state")
                    .should("have.text", "ACD")
                    .wait(500)
                    .window()
                    .then((win: any) => {
                        const log = win.__log
                        // B's exit animation finishes mid-transition render
                        expect(log.exitAnimationComplete).to.be.greaterThan(
                            log.transitionRender
                        )
                        expect(log.exitAnimationComplete).to.be.lessThan(
                            log.transitionCommit
                        )
                        // onExitComplete waits until B has been removed,
                        // which happens with the transition commit (#2538)
                        expect(log.exitComplete).to.be.greaterThan(
                            log.transitionCommit
                        )
                    })
                    .get(".item")
                    .then(($items: any) => {
                        expect(
                            Array.from($items).map((el: any) => el.id)
                        ).to.deep.equal(["item-A", "item-C", "item-D"])
                    })
            })
        }
    }
})
