var warned = new Set();
export function hasWarned(message) {
    return warned.has(message);
}
export function warnOnce(condition, message, element) {
    if (condition || warned.has(message))
        return;
    console.warn(message);
    if (element)
        console.warn(element);
    warned.add(message);
}
//# sourceMappingURL=warn-once.js.map