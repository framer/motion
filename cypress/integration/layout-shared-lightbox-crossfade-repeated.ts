import { pipe } from "popmotion"

interface BoundingBox {
    top: number
    left: number
    width: number
    height: number
}

function expectBbox(element: HTMLElement, expectedBbox: BoundingBox) {
    const bbox = element.getBoundingClientRect()
    expect(bbox.top).to.equal(expectedBbox.top)
    expect(bbox.left).to.equal(expectedBbox.left)
    expect(bbox.width).to.equal(expectedBbox.width)
    expect(bbox.height).to.equal(expectedBbox.height)
}

describe("AnimateSharedLayout lightbox example, toggle back and forth", () => {
    it("Correctly animates back and forth with crossfade", () => {
        function open(session: Cypress.cy) {
            return session
                .get("#item-parent")
                .trigger("click")
                .wait(50)
                .get("#item-parent")
                .should(([$box]: any) => {
                    expect(window.getComputedStyle($box).borderRadius).to.equal(
                        "2.25225% / 0.88968%"
                    )
                    expect(window.getComputedStyle($box).opacity).to.equal("1")
                    expectBbox($box, {
                        top: 49,
                        left: 209,
                        width: 222,
                        height: 562,
                    })
                })
                .get("#item-child")
                .should(([$box]: any) => {
                    expect(window.getComputedStyle($box).borderRadius).to.equal(
                        "50%"
                    )
                    expect(window.getComputedStyle($box).opacity).to.equal(
                        "0.5"
                    )
                    expectBbox($box, {
                        top: 292.5,
                        left: 272.5,
                        width: 50,
                        height: 50,
                    })
                })
                .get("#parent")
                .should(([$box]: any) => {
                    expect(window.getComputedStyle($box).borderRadius).to.equal(
                        "2.25225% / 0.88968%"
                    )
                    expect(window.getComputedStyle($box).opacity).to.equal(
                        "0.6"
                    )
                    expectBbox($box, {
                        top: 49,
                        left: 209,
                        width: 222,
                        height: 562,
                    })
                })
                .get("#child")
                .should(([$box]: any) => {
                    expect(window.getComputedStyle($box).borderRadius).to.equal(
                        "50%"
                    )
                    expect(window.getComputedStyle($box).opacity).to.equal(
                        "0.5"
                    )
                    expectBbox($box, {
                        top: 292.5,
                        left: 272.5,
                        width: 50,
                        height: 50,
                    })
                })
        }

        function close(session: Cypress.cy) {
            return session
                .get("#overlay")
                .trigger("click")
                .wait(50)
                .get("#item-parent")
                .should(([$box]: any) => {
                    expect(window.getComputedStyle($box).borderRadius).to.equal(
                        "0.271444% / 0.0864753%"
                    )
                    expect(window.getComputedStyle($box).opacity).to.equal("1")
                    expectBbox($box, {
                        height: 578.199951171875,
                        left: 209.89999389648438,
                        top: 40.900001525878906,
                        width: 184.20001220703125,
                    })
                })
                .get("#item-child")
                .should(([$box]: any) => {
                    expect(window.getComputedStyle($box).borderRadius).to.equal(
                        "50%"
                    )
                    expect(window.getComputedStyle($box).opacity).to.equal(
                        "0.5"
                    )
                    expectBbox($box, {
                        top: 303.75,
                        left: 274.75,
                        width: 50,
                        height: 50,
                    })
                })
                .get("#parent")
                .should(([$box]: any) => {
                    expect(window.getComputedStyle($box).borderRadius).to.equal(
                        "0.271444% / 0.0864753%"
                    )
                    expect(window.getComputedStyle($box).opacity).to.equal(
                        "0.198997"
                    )
                    expectBbox($box, {
                        height: 578.199951171875,
                        left: 209.89999389648438,
                        top: 40.900001525878906,
                        width: 184.20001220703125,
                    })
                })
                .get("#child")
                .should(([$box]: any) => {
                    expect(window.getComputedStyle($box).borderRadius).to.equal(
                        "50%"
                    )
                    expect(window.getComputedStyle($box).opacity).to.equal(
                        "0.5"
                    )
                    expectBbox($box, {
                        top: 303.75,
                        left: 274.75,
                        width: 50,
                        height: 50,
                    })
                })
        }

        pipe(
            open,
            close,
            (session: Cypress.cy) => session.wait(200),
            open,
            close,
            (session: Cypress.cy) => session.wait(200),
            open,
            close
        )(
            cy
                .visit(
                    `?test=layout-shared-lightbox-crossfade&type=crossfade&partial-ease=true`
                )
                .wait(50)
        )
    })
    it("Correctly animates back and forth with switch", () => {
        function open(session: Cypress.cy) {
            return session
                .get("#item-parent")
                .trigger("click")
                .wait(50)
                .should(([$box]: any) => {
                    expect(window.getComputedStyle($box).visibility).to.equal(
                        "hidden"
                    )
                })
                .get("#parent")
                .should(([$box]: any) => {
                    expect(window.getComputedStyle($box).borderRadius).to.equal(
                        "2.25225% / 0.88968%"
                    )
                    expect(window.getComputedStyle($box).opacity).to.equal("1")
                    expectBbox($box, {
                        top: 49,
                        left: 209,
                        width: 222,
                        height: 562,
                    })
                })
        }

        function close(session: Cypress.cy) {
            return session
                .get("#overlay")
                .trigger("click")
                .wait(50)
                .get("#item-parent")
                .should(([$box]: any) => {
                    expect(window.getComputedStyle($box).visibility).to.equal(
                        "hidden"
                    )
                })
                .get("#parent")
                .should(([$box]: any) => {
                    expect(window.getComputedStyle($box).borderRadius).to.equal(
                        "0.271444% / 0.0864753%"
                    )
                    expect(window.getComputedStyle($box).opacity).to.equal("1")
                    expectBbox($box, {
                        height: 578.199951171875,
                        left: 209.89999389648438,
                        top: 40.900001525878906,
                        width: 184.20001220703125,
                    })
                })
        }

        pipe(
            open,
            close,
            (session: Cypress.cy) => session.wait(200),
            open,
            close
        )(
            cy
                .visit(
                    `?test=layout-shared-lightbox-crossfade&type=switch&partial-ease=true`
                )
                .wait(50)
        )
    })
})
