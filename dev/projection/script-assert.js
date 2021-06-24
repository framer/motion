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
    addPageScroll({ top, right, bottom, left }, x, y) {
        return {
            top: top - y,
            right: right - x,
            bottom: bottom - y,
            left: left - x,
        }
    },
}
