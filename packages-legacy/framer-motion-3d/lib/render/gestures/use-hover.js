export function useHover(isStatic, { whileHover, onHoverStart, onHoverEnd, onPointerOver, onPointerOut, }, visualElement) {
    const isHoverEnabled = whileHover || onHoverStart || onHoverEnd;
    if (isStatic || !visualElement || !isHoverEnabled)
        return {};
    return {
        onPointerOver: (event) => {
            var _a;
            (_a = visualElement.animationState) === null || _a === void 0 ? void 0 : _a.setActive("whileHover", true);
            onPointerOver && onPointerOver(event);
        },
        onPointerOut: (event) => {
            var _a;
            (_a = visualElement.animationState) === null || _a === void 0 ? void 0 : _a.setActive("whileHover", false);
            onPointerOut && onPointerOut(event);
        },
    };
}
//# sourceMappingURL=use-hover.js.map