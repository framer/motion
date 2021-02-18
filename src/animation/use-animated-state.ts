import { useEffect, useState } from "react"
import { useConstant } from "../utils/use-constant"
import { checkTargetForNewValues, getOrigin } from "../render/utils/setters"
import { TargetAndTransition } from "../types"
import { visualElement } from "../render"
import { ResolvedValues } from "../render/types"
import { axisBox } from "../utils/geometry"
import { animateVisualElement } from "../render/utils/animation"

interface AnimatedStateOptions {
    initialState: ResolvedValues
}

const stateVisualElement = visualElement<
    ResolvedValues,
    {},
    AnimatedStateOptions
>({
    createRenderState: () => ({}),
    build() {},
    measureViewportBox: axisBox,
    resetTransform() {},
    restoreTransform() {},
    removeValueFromMutableState() {},
    render() {},
    scrapeMotionValuesFromProps() {
        return {}
    },

    readValueFromInstance(_state, key, options) {
        return options.initialState[key] || 0
    },

    makeTargetAnimatable(element, { transition, transitionEnd, ...target }) {
        const origin = getOrigin(target as any, transition || {}, element)
        checkTargetForNewValues(element, target, origin as any)
        return { transition, transitionEnd, ...target }
    },
})

/**
 * This is not an officially supported API and may be removed
 * on any version.
 * @internal
 */
export function useAnimatedState(initialState: any) {
    const [animationState, setAnimationState] = useState(initialState)
    const element = useConstant(() =>
        stateVisualElement({ props: {} }, { initialState })
    )

    useEffect(() => {
        ;(element.ref as any)({})
        return () => (element.ref as any)(null)
    }, [])

    useEffect(() => {
        element.setProps({
            onUpdate: (v) => setAnimationState({ ...v }),
        })
    })

    const startAnimation = useConstant(
        () => (animationDefinition: TargetAndTransition) => {
            return animateVisualElement(element, animationDefinition)
        }
    )

    return [animationState, startAnimation]
}
