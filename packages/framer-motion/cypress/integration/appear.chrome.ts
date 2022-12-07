Cypress.config({
    baseUrl: "http://localhost:8000/dev/appear/",
})

describe("Project the element to its original box", () => {
    const tests = require("../fixtures/appear-tests.json")

    tests.forEach((test) => {
        it(test, () => {
            cy.visit(test)
            cy.wait(200)
                .get('[data-layout-correct="false"]')
                .should("not.exist")
        })
    })
})
