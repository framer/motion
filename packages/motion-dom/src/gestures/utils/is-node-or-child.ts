/**
 * Recursively traverse up the tree to check whether the provided child node
 * is the parent or a descendant of it.
 *
 * @param parent - Element to find
 * @param child - Element to test against parent
 */
export const isNodeOrChild = (
    parent: Element | null,
    child?: Element | null
): boolean => {
    if (!child) {
        return false
    } else if (parent === child) {
        return true
    } else {
        return isNodeOrChild(parent, child.parentElement)
    }
}
