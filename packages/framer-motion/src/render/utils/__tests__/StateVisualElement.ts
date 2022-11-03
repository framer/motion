import { ResolvedValues } from "../../types"
import { checkTargetForNewValues, getOrigin } from "../setters"
import { MotionProps } from "../../../motion/types"
import { createBox } from "../../../projection/geometry/models"
import { VisualElement } from "../../VisualElement"
import { TargetAndTransition } from "../../.."

export class StateVisualElement extends VisualElement<
    ResolvedValues,
    {},
    { initialState: ResolvedValues }
> {
    type: "state"
    build() {}
    measureInstanceViewportBox = createBox
    removeValueFromRenderState() {}
    renderInstance() {}
    scrapeMotionValuesFromProps() {
        return {}
    }

    sortInstanceNodePosition() {
        return 0
    }

    getBaseTargetFromProps(props: MotionProps, key: string) {
        return props.style?.[key]
    }

    readValueFromInstance(
        _state: {},
        key: string,
        options: { initialState: ResolvedValues }
    ) {
        return options.initialState[key] || 0
    }

    makeTargetAnimatableFromInstance({
        transition,
        transitionEnd,
        ...target
    }: TargetAndTransition) {
        const origin = getOrigin(target as any, transition || {}, this)
        checkTargetForNewValues(this, target, origin as any)
        return { transition, transitionEnd, ...target }
    }
}
