import { useEffect, useState } from "react"
import { useConstant } from "../utils/use-constant"
import { checkTargetForNewValues, getOrigin } from "../render/utils/setters"
import { TargetAndTransition } from "../types"
import { visualElement } from "../render"
import { ResolvedValues } from "../render/types"
import { axisBox } from "../utils/geometry"
import { animateVisualElement } from "../render/utils/animation"
import { makeUseVisualState } from "../motion/utils/use-visual-state"

interface AnimatedStateOptions {
    initialState: ResolvedValues
}

const createObject = () => ({})

const stateVisualElement = visualElement<
    ResolvedValues,
    {},
    AnimatedStateOptions
>({
    build() {},
    measureViewportBox: axisBox,
    resetTransform() {},
    restoreTransform() {},
    removeValueFromRenderState() {},
    render() {},
    scrapeMotionValuesFromProps: createObject,

    readValueFromInstance(_state, key, options) {
        return options.initialState[key] || 0
    },

    makeTargetAnimatable(element, { transition, transitionEnd, ...target }) {
        const origin = getOrigin(target as any, transition || {}, element)
        checkTargetForNewValues(element, target, origin as any)
        return { transition, transitionEnd, ...target }
    },
})

const useVisualState = makeUseVisualState({
    scrapeMotionValuesFromProps: createObject,
    createRenderState: createObject,
})

/**
 * This is not an officially supported API and may be removed
 * on any version.
 * @internal
 */
export function useAnimatedState(initialState: any) {
    const [animationState, setAnimationState] = useState(initialState)

    const visualState = useVisualState({}, false)

    const element = useConstant(() =>
        stateVisualElement({ props: {}, visualState }, { initialState })
    )

    useEffect(() => {
        element.mount({})
        return element.unmount()
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
