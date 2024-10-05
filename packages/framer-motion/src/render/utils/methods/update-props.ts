import { PresenceContextProps } from "../../../context/PresenceContext"
import { MotionProps } from "../../../motion/types"
import { VisualElement } from "../../VisualElement"
import { updateMotionValuesFromProps } from "../motion-values"

const propEventHandlers = [
    "AnimationStart",
    "AnimationComplete",
    "Update",
    "BeforeLayoutMeasure",
    "LayoutMeasure",
    "LayoutAnimationStart",
    "LayoutAnimationComplete",
] as const

/**
 * Update the provided props. Ensure any newly-added motion values are
 * added to our map, old ones removed, and listeners updated.
 */
export function updateVisualElementProps(
    element: VisualElement,
    props: MotionProps,
    presenceContext: PresenceContextProps | null
) {
    if (props.transformTemplate || element.props.transformTemplate) {
        element.scheduleRender()
    }

    element.prevProps = element.props
    element.props = props

    element.prevPresenceContext = element.presenceContext
    element.presenceContext = presenceContext

    /**
     * Update prop event handlers ie onAnimationStart, onAnimationComplete
     */
    for (let i = 0; i < propEventHandlers.length; i++) {
        const key = propEventHandlers[i]
        if (element.propEventSubscriptions[key]) {
            element.propEventSubscriptions[key]()
            delete element.propEventSubscriptions[key]
        }

        const listenerName = ("on" + key) as keyof typeof props
        const listener = props[listenerName]
        if (listener) {
            element.propEventSubscriptions[key] = element.on(
                key as any,
                listener
            )
        }
    }

    element.prevMotionValues = updateMotionValuesFromProps(
        element,
        element.scrapeMotionValuesFromProps(props, element.prevProps, element),
        element.prevMotionValues
    )

    if (element.handleChildMotionValue) {
        element.handleChildMotionValue()
    }
}
