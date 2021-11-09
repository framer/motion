type IntersectionHandler = (entry: IntersectionObserverEntry) => void

interface ElementIntersectionObservers {
    [key: string]: IntersectionObserver
}

const observerCallbacks = new WeakMap<Element, IntersectionHandler>()

const observers = new WeakMap<
    Element | Document,
    ElementIntersectionObservers
>()

const fireObserverCallback = (entry: IntersectionObserverEntry) => {
    observerCallbacks.get(entry.target)?.(entry)
}

const handleObserverCallbacks: IntersectionObserverCallback = (entries) => {
    entries.forEach(fireObserverCallback)
}

function initIntersectionObserver({
    root,
    ...options
}: IntersectionObserverInit): IntersectionObserver {
    if (!observers.has(root || document)) {
        observers.set(root || document, {})
    }
    const rootObservers = observers.get(root || document)!

    const key = JSON.stringify(options)
    if (!rootObservers[key]) {
        rootObservers[key] = new IntersectionObserver(handleObserverCallbacks, {
            root,
            ...options,
        })
    }

    return rootObservers[key]
}

export function createIntersectionObserver(
    element: Element,
    options: IntersectionObserverInit,
    callback: IntersectionHandler
) {
    const rootInteresectionObserver = initIntersectionObserver(options)

    observerCallbacks.set(element, callback)
    rootInteresectionObserver.observe(element)

    return () => {
        rootInteresectionObserver.unobserve(element)
    }
}
