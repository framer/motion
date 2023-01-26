Cypress.config({
    baseUrl: "http://localhost:8000/dev/optimized-appear/",
})

describe("Correctly plays and resumes from optimized appear animations", () => {
    const tests = require("../fixtures/appear-tests.json")

    tests.forEach((test) => {
        it(test, () => {
            cy.visit(test)
            cy.wait(1000)
                .get('[data-layout-correct="false"]')
                .should("not.exist")
        })
    })
})
