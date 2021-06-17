window.Assert = {
    matchViewportBox: (element, expected) => {
        const bbox = element.getBoundingClientRect()
        if (
            expected.top !== bbox.top ||
            expected.right !== bbox.right ||
            expected.bottom !== bbox.bottom ||
            expected.left !== bbox.left
        ) {
            element.dataset.layoutCorrect = "false"
        }
    },
}
