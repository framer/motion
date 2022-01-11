import { isBrowser } from "../utils/is-browser";
// We check for event support via functions in case they've been mocked by a testing suite.
export var supportsPointerEvents = function () {
    return isBrowser && window.onpointerdown === null;
};
export var supportsTouchEvents = function () {
    return isBrowser && window.ontouchstart === null;
};
export var supportsMouseEvents = function () {
    return isBrowser && window.onmousedown === null;
};
//# sourceMappingURL=utils.js.map