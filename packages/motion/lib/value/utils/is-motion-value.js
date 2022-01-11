export var isMotionValue = function (value) {
    return Boolean(value !== null && typeof value === "object" && value.getVelocity);
};
//# sourceMappingURL=is-motion-value.js.map