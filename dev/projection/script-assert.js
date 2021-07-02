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
        }
    },
    matchVisibility: (element, expected) => {
        if (expected === "hidden") {
            if (element.style.visibility !== expected) {
                element.dataset.layoutCorrect = "false"
            }
        } else {
            if (element.style.visibility === "hidden") {
                element.dataset.layoutCorrect = "false"
            }
        }
    },
    matchOpacity: (element, expected) => {
        const elementOpacity =
            element.style.opacity === "" ? 1 : element.style.opacity

        if (elementOpacity !== expected) {
            element.dataset.layoutCorrect = "false"
        }
    },
    matchBorderRadius: (element, expected) => {
        if (element.style.borderRadius !== expected) {
            element.dataset.layoutCorrect = "false"
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
