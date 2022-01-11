function isAnimationControls(v) {
    return typeof v === "object" && typeof v.start === "function";
}

export { isAnimationControls };
