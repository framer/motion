import { initPrefersReducedMotion } from "../../../utils/reduced-motion"
import {
    hasReducedMotionListener,
    prefersReducedMotion,
} from "../../../utils/reduced-motion/state"
import { warnOnce } from "../../../utils/warn-once"
import { visualElementStore } from "../../store"
import type { VisualElement } from "../../VisualElement"
import { updateVisualElementProps } from "./update-props"

export function mountVisualElement<Instance>(
    element: VisualElement,
    instance: Instance
) {
    element.current = instance

    visualElementStore.set(instance, element)

    if (element.projection && !element.projection.instance) {
        element.projection.mount(instance)
    }

    if (
        element.parent &&
        element.isVariantNode &&
        !element.isControllingVariants
    ) {
        element.removeFromVariantTree = element.parent.addVariantChild(element)
    }

    element.values.forEach((value, key) =>
        element.bindToMotionValue(key, value)
    )

    if (!hasReducedMotionListener.current) {
        initPrefersReducedMotion()
    }

    element.shouldReduceMotion =
        element.reducedMotionConfig === "never"
            ? false
            : element.reducedMotionConfig === "always"
            ? true
            : prefersReducedMotion.current

    if (process.env.NODE_ENV !== "production") {
        warnOnce(
            element.shouldReduceMotion !== true,
            "You have Reduced Motion enabled on your device. Animations may not appear as expected."
        )
    }

    if (element.parent) element.parent.children.add(element)
    updateVisualElementProps(element, element.props, element.presenceContext)
}
