Cypress.config({
    baseUrl: "http://localhost:8000/dev/projection/",
})

describe("Project the element to its original box", () => {
    const tests = require("../fixtures/projection-tests.json")

    tests.forEach((test) => {
        it(test, () => {
            cy.visit(test)
            cy.wait(250)
                .get('[data-layout-correct="false"]')
                .should("not.exist")
        })
    })
})
