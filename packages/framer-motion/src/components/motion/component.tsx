import * as React from "react"
import {
    createElement,
    MutableRefObject,
    forwardRef,
    useContext,
    useEffect,
    useRef,
    useMemo,
} from "react"
import { MotionConfigContext } from "../../context/MotionConfigContext"
import { MotionProps } from "./types"
import { useStyle } from "./utils/use-style"
import { isBrowser } from "../../utils/is-browser"
import { MotionState } from "./state"
import { MotionStateContext } from "../../context/MotionStateContext"

export function createMotionComponent<Props extends {}>(
    Component: string | React.ComponentType<React.PropsWithChildren<Props>>
) {
    function MotionComponent(
        {
            initial,
            animate,
            press,
            hover,
            inView,
            inViewOptions,
            variants,
            transition,
            style,
            ...props
        }: Props & MotionProps,
        externalRef: MutableRefObject<HTMLElement>
    ) {
        const options = {
            initial,
            animate,
            press,
            hover,
            inView,
            inViewOptions,
            variants,
            transition,
        }

        const ref = externalRef || useRef<HTMLElement>(null)

        const parentState = useContext(MotionStateContext)
        const state = useMemo(() => new MotionState(options, parentState), [])

        /**
         * If we're rendering in a static environment, we only visually update the component
         * as a result of a React-rerender rather than interactions or animations. This
         * means we don't need to load additional memory structures like VisualElement,
         * or any gesture/animation features.
         */
        const config = useContext(MotionConfigContext)

        /**
         * Only load and run animations in browsers outside the Framer canvas.
         */
        if (!config.isStatic && isBrowser) {
            useEffect(() => ref.current && state.mount(ref.current), [])
            useEffect(() => state.update(options))
        }

        const element = createElement(Component, {
            ...props,
            ref,
            style: useStyle(style),
        } as any)

        return (
            <MotionStateContext.Provider value={state}>
                {element}
            </MotionStateContext.Provider>
        )
    }

    return forwardRef(MotionComponent)
}
