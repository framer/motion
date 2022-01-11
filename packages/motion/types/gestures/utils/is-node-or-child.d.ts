/**
 * Recursively traverse up the tree to check whether the provided child node
 * is the parent or a descendant of it.
 *
 * @param parent - Element to find
 * @param child - Element to test against parent
 */
export declare const isNodeOrChild: (parent: Element, child?: Element | null | undefined) => boolean;
