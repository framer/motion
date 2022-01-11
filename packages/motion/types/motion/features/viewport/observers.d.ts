declare type IntersectionHandler = (entry: IntersectionObserverEntry) => void;
export declare function observeIntersection(element: Element, options: IntersectionObserverInit, callback: IntersectionHandler): () => void;
export {};
