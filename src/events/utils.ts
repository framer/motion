import { isBrowser } from "../utils/is-browser"

// We check for event support via functions in case they've been mocked by a testing suite.
export const supportsPointerEvents = () =>
    isBrowser && window.onpointerdown === null
export const supportsTouchEvents = () =>
    isBrowser && window.ontouchstart === null
export const supportsMouseEvents = () =>
    isBrowser && window.onmousedown === null
