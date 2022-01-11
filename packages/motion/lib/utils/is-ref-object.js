export function isRefObject(ref) {
    return (typeof ref === "object" &&
        Object.prototype.hasOwnProperty.call(ref, "current"));
}
//# sourceMappingURL=is-ref-object.js.map