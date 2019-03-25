// Converted from dom-testing-library event.js: https://github.com/kentcdodds/dom-testing-library/blob/master/src/events.js
function fireEvent(element: Element, event: any) {
    return element.dispatchEvent(event)
}

export const fireCustomEvent = (
    eventName: string,
    EventType: string = "Event",
    defaultInit: {} = { bubbles: true, cancelable: true }
) => {
    return function(node: Element, init?: {}): boolean {
        const eventInit: any = Object.assign({}, defaultInit, init)
        let _eventInit$target = eventInit.target
        _eventInit$target =
            _eventInit$target === undefined ? {} : _eventInit$target

        const { value, files, targetProperties } = _eventInit$target
        Object.assign(node, targetProperties)
        if (value !== undefined) {
            setNativeValue(node, value)
        }
        if (files !== undefined) {
            // input.files is a read-only property so this is not allowed:
            // input.files = [file]
            // so we have to use this workaround to set the property
            Object.defineProperty(node, "files", {
                configurable: true,
                enumerable: true,
                writable: true,
                value: files,
            })
        }
        const window = node.ownerDocument!.defaultView!
        const EventConstructor = window[EventType] || (window as any).Event
        const event = new EventConstructor(eventName, eventInit)
        return fireEvent(node, event)
    }
}

// // function written after some investigation here:
// // https://github.com/facebook/react/issues/10135#issuecomment-401496776
function setNativeValue(element: Element, value: any) {
    const _ref = Object.getOwnPropertyDescriptor(element, "value") || {},
        valueSetter = _ref.set

    const prototype = Object.getPrototypeOf(element)

    const _ref2 = Object.getOwnPropertyDescriptor(prototype, "value") || {},
        prototypeValueSetter = _ref2.set

    if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
        prototypeValueSetter.call(element, value)
    } /* istanbul ignore next (I don't want to bother) */ else if (
        valueSetter
    ) {
        valueSetter.call(element, value)
    } else {
        throw new Error("The given element does not have a value setter")
    }
}
