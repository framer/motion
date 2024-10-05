import { isSVGElement } from "../../render/dom/utils/is-svg-element"
import { SVGVisualElement } from "../../render/svg/SVGVisualElement"
import { HTMLVisualElement } from "../../render/html/HTMLVisualElement"
import { visualElementStore } from "../../render/store"
import { ObjectVisualElement } from "../../render/object/ObjectVisualElement"
import { mountVisualElement } from "../../render/utils/methods/mount"

export function createDOMVisualElement(element: HTMLElement | SVGElement) {
    const options = {
        presenceContext: null,
        props: {},
        visualState: {
            renderState: {
                transform: {},
                transformOrigin: {},
                style: {},
                vars: {},
                attrs: {},
            },
            latestValues: {},
        },
    }
    const node = isSVGElement(element)
        ? new SVGVisualElement(options)
        : new HTMLVisualElement(options)

    mountVisualElement(node, element as any)

    visualElementStore.set(element, node)
}

export function createObjectVisualElement(subject: Object) {
    const options = {
        presenceContext: null,
        props: {},
        visualState: {
            renderState: {
                output: {},
            },
            latestValues: {},
        },
    }
    const node = new ObjectVisualElement(options)

    mountVisualElement(node, subject)

    visualElementStore.set(subject, node)
}
