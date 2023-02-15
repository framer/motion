import { checkTargetForNewValues, getOrigin } from "../utils/setters"
import { DOMVisualElementOptions } from "../dom/types"
import { parseDomVariant } from "../dom/utils/parse-dom-variant"
import { VisualElement } from "../VisualElement"
import { MotionProps } from "../../motion/types"
import { MotionValue } from "../../value"
import { TargetAndTransition } from "../.."
import { HTMLRenderState } from "../html/types"

export abstract class DOMVisualElement<
    Instance extends HTMLElement | SVGElement = HTMLElement,
    State extends HTMLRenderState = HTMLRenderState,
    Options extends DOMVisualElementOptions = DOMVisualElementOptions
> extends VisualElement<Instance, State, Options> {
    sortInstanceNodePosition(a: Instance, b: Instance): number {
        /**
         * compareDocumentPosition returns a bitmask, by using the bitwise &
         * we're returning true if 2 in that bitmask is set to true. 2 is set
         * to true if b preceeds a.
         */
        return a.compareDocumentPosition(b) & 2 ? 1 : -1
    }

    getBaseTargetFromProps(
        props: MotionProps,
        key: string
    ): string | number | MotionValue<any> | undefined {
        return props.style ? props.style[key] : undefined
    }

    removeValueFromRenderState(
        key: string,
        { vars, style }: HTMLRenderState
    ): void {
        delete vars[key]
        delete style[key]
    }

    makeTargetAnimatableFromInstance(
        { transition, transitionEnd, ...target }: TargetAndTransition,
        { transformValues }: MotionProps,
        isMounted: boolean
    ): TargetAndTransition {
        let origin = getOrigin(target as any, transition || {}, this)

        /**
         * If Framer has provided a function to convert `Color` etc value types, convert them
         */
        if (transformValues) {
            if (transitionEnd)
                transitionEnd = transformValues(transitionEnd as any)
            if (target) target = transformValues(target as any)
            if (origin) origin = transformValues(origin as any)
        }

        if (isMounted) {
            checkTargetForNewValues(this, target, origin as any)
            const parsed = parseDomVariant(this, target, origin, transitionEnd)
            transitionEnd = parsed.transitionEnd
            target = parsed.target
        }

        return {
            transition,
            transitionEnd,
            ...target,
        }
    }
}
