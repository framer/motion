/**
 * Each of these is given a unique bit value so we can check if any of these is animating
 * with a simple falsey check.
 */
export const layoutFlags = {
    width: 1,
    height: 2,
    top: 4,
    left: 8,
    right: 16,
    bottom: 32,
}

export const layoutKeys = new Set(Object.keys(layoutFlags))
