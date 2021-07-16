window.Assert = {
    matchViewportBox: (element, expected, threshold = 0.01) => {
        const bbox = element.getBoundingClientRect()
        if (
            Math.abs(expected.top - bbox.top) > threshold ||
            Math.abs(expected.right - bbox.right) > threshold ||
            Math.abs(expected.bottom - bbox.bottom) > threshold ||
            Math.abs(expected.left - bbox.left) > threshold
        ) {
            element.dataset.layoutCorrect = "false"
            console.error("Viewport box doesn't match")
        }
    },
    matchVisibility: (element, expected) => {
        if (expected === "hidden") {
            if (element.style.visibility !== expected) {
                element.dataset.layoutCorrect = "false"
                console.error("visibility doesn't match 'hidden'")
            }
        } else {
            if (element.style.visibility === "hidden") {
                element.dataset.layoutCorrect = "false"
                console.error("visibility is unexpectedly 'hidden'")
            }
        }
    },
    matchOpacity: (element, expected) => {
        const elementOpacity =
            element.style.opacity === "" ? 1 : parseFloat(element.style.opacity)

        if (elementOpacity !== expected) {
            element.dataset.layoutCorrect = "false"
            console.error(
                `opacity ${elementOpacity} doesn't match expected ${expected}`
            )
        }
    },
    matchBorderRadius: (element, expected) => {
        if (element.style.borderRadius !== expected) {
            element.dataset.layoutCorrect = "false"
            console.error(
                `border-radius ${element.style.borderRadius} doesn't match expected ${expected}`
            )
        }
    },
    matchRotate: (element, expected) => {
        if (!element.style.transform.includes(`${expected}deg`)) {
            element.dataset.layoutCorrect = "false"
            console.error(
                `rotate in ${element.style.transform} doesn't match expected ${expected}deg`
            )
        }
    },
    addPageScroll({ top, right, bottom, left }, x, y) {
        return {
            top: top - y,
            right: right - x,
            bottom: bottom - y,
            left: left - x,
        }
    },
}
