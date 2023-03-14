import { useEffect, useState } from "react"
import { useConstant } from "../../utils/use-constant"
import { checkTargetForNewValues, getOrigin } from "../../render/utils/setters"
import { TargetAndTransition } from "../../types"
import { ResolvedValues } from "../../render/types"
import { makeUseVisualState } from "../../motion/utils/use-visual-state"
import { createBox } from "../../projection/geometry/models"
import { VisualElement } from "../../render/VisualElement"
import { animateVisualElement } from "../interfaces/visual-element"

interface AnimatedStateOptions {
    initialState: ResolvedValues
}

const createObject = () => ({})

class StateVisualElement extends VisualElement<
    ResolvedValues,
    {},
    AnimatedStateOptions
> {
    type: "state"
    build() {}
    measureInstanceViewportBox() {
        return createBox()
    }
    resetTransform() {}
    restoreTransform() {}
    removeValueFromRenderState() {}
    renderInstance() {}
    scrapeMotionValuesFromProps() {
        return createObject()
    }
    getBaseTargetFromProps() {
        return undefined
    }

    readValueFromInstance(
        _state: ResolvedValues,
        key: string,
        options: AnimatedStateOptions
    ) {
        return options.initialState[key] || 0
    }

    sortInstanceNodePosition() {
        return 0
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

const useVisualState = makeUseVisualState({
    scrapeMotionValuesFromProps: createObject,
    createRenderState: createObject,
})

/**
 * This is not an officially supported API and may be removed
 * on any version.
 */
export function useAnimatedState(initialState: any) {
    const [animationState, setAnimationState] = useState(initialState)
    const visualState = useVisualState({}, false)

    const element = useConstant(() => {
        return new StateVisualElement(
            { props: {}, visualState, presenceContext: null },
            { initialState }
        )
    })

    useEffect(() => {
        element.mount({})
        return () => element.unmount()
    }, [element])

    useEffect(() => {
        element.update(
            {
                onUpdate: (v) => {
                    setAnimationState({ ...v })
                },
            },
            null
        )
    }, [setAnimationState, element])

    const startAnimation = useConstant(
        () => (animationDefinition: TargetAndTransition) => {
            return animateVisualElement(element, animationDefinition)
        }
    )

    return [animationState, startAnimation]
}
