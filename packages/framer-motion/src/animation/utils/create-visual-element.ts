import { isSVGElement } from "../../render/dom/utils/is-svg-element"
import { SVGVisualElement } from "../../render/svg/SVGVisualElement"
import { HTMLVisualElement } from "../../render/html/HTMLVisualElement"
import { visualElementStore } from "../../render/store"

export function createVisualElement(element: HTMLElement | SVGElement) {
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
        ? new SVGVisualElement(options, {
              enableHardwareAcceleration: false,
          })
        : new HTMLVisualElement(options, {
              enableHardwareAcceleration: true,
          })

    node.mount(element as any)

    visualElementStore.set(element, node)
}
