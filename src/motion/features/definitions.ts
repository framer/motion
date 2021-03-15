import { FeatureDefinitions } from "./types"

export const featureDefinitions: FeatureDefinitions = {
    animation: {
        isEnabled: ({
            animate,
            whileHover,
            whileFocus,
            whileTap,
            whileDrag,
            exit,
            variants,
        }) =>
            Boolean(
                animate ||
                    variants ||
                    exit ||
                    whileHover ||
                    whileTap ||
                    whileDrag ||
                    whileFocus
            ),
    },
    exit: {
        isEnabled: ({ exit }) => !!exit,
    },
    drag: {
        isEnabled: ({ drag, dragControls }) => !!drag || !!dragControls,
    },
    focus: {
        isEnabled: ({ whileFocus }) => !!whileFocus,
    },
    hover: {
        isEnabled: ({ whileHover, onHoverStart, onHoverEnd }) =>
            !!whileHover || !!onHoverStart || !!onHoverEnd,
    },
    tap: {
        isEnabled: ({ whileTap, onTap, onTapStart, onTapEnd }) =>
            !!whileTap || !!onTap || !!onTapStart || !!onTapEnd,
    },
    pan: {
        isEnabled: ({ onPan, onPanStart, onPanSessionStart, onPanEnd }) =>
            !!onPan || !!onPanStart || !!onPanSessionStart || !!onPanEnd,
    },
    layoutAnimation: {
        isEnabled: ({ layout, layoutId }) => !!layout || layoutId !== undefined,
    },
}
