history.scrollRestoration = "manual"

const messages = new Set()

function showError(element, msg) {
    element.dataset.layoutCorrect = "false"

    if (!messages.has(msg)) {
        messages.add(msg)
        console.error(msg)
        document.body.innerHTML += `<p style="color: black;z-index: 1000;position: absolute;">${msg}</p>`
    }
}

window.Assert = {
    matchViewportBox: (element, expected, threshold = 0.01) => {
        const bbox = element.getBoundingClientRect()
        if (
            Math.abs(expected.top - bbox.top) > threshold ||
            Math.abs(expected.right - bbox.right) > threshold ||
            Math.abs(expected.bottom - bbox.bottom) > threshold ||
            Math.abs(expected.left - bbox.left) > threshold
        ) {
            showError(element, "Viewport box doesn't match")
        }
    },
    matchVisibility: (element, expected) => {
        if (expected === "hidden") {
            if (element.style.visibility !== expected) {
                showError(element, "visibility doesn't match 'hidden'")
            }
        } else {
            if (element.style.visibility === "hidden") {
                showError(element, "visibility is unexpectedly 'hidden'")
            }
        }
    },
    matchOpacity: (element, expected) => {
        const elementOpacity =
            window.getComputedStyle(element).opacity === ""
                ? 1
                : parseFloat(window.getComputedStyle(element).opacity)

        if (elementOpacity !== expected) {
            showError(
                element,
                `opacity ${elementOpacity} doesn't match expected ${expected}`
            )
        }
    },
    matchBorderRadius: (element, expected) => {
        let radius = element.style.borderRadius

        // Different browsers might return borders to a different accuracy
        if (typeof expected === "string") {
            expected = roundBorder(expected)
            radius = roundBorder(radius)
        }

        if (
            (expected !== 0 && radius !== expected) ||
            (expected === 0 && radius !== "")
        ) {
            showError(
                element,
                `border-radius ${radius} doesn't match expected ${expected}`
            )
        }
    },
    matchRotate: (element, expected) => {
        if (!element.style.transform.includes(`${expected}deg`)) {
            showError(
                element,
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

function roundBorder(border) {
    return border
        .replace(" / ", " ")
        .split(" ")
        .map((num) => parseInt(num.trim()))
        .join(" / ")
}
