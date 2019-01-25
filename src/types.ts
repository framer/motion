import { CSSProperties } from "react"

export type Props = { [key: string]: any }

export type EasingFunction = (v: number) => number

export type CubicBezier = [number, number, number, number]

export type Easing =
    | CubicBezier
    | "linear"
    | "easeIn"
    | "easeOut"
    | "easeInOut"
    | "circIn"
    | "circOut"
    | "circInOut"
    | "backIn"
    | "backOut"
    | "backInOut"
    | "anticipate"
    | EasingFunction

export type TransitionOrchestration = {
    delay?: number
    beforeChildren?: boolean
    afterChildren?: boolean
    delayChildren?: number
    staggerChildren?: number
    staggerDirection?: 1 | -1
}

export type Tween = {
    type?: "tween"
    duration?: number
    ease?: Easing
    elapsed?: number
    loop?: number
    flip?: number
    yoyo?: number
    from?: number | string
    to?: number | string
    velocity?: number
    delay?: number
}

export type Spring = {
    type: "spring"
    stiffness?: number
    damping?: number
    mass?: number
    restSpeed?: number
    restDelta?: number
    from?: number | string
    to?: number | string
    velocity?: number
    delay?: number
}

export type Decay = {
    type: "decay"
    modifyTarget?: (v: number) => number
    power?: number
    timeConstant?: number
    restDelta?: number
    from?: number | string
    velocity?: number
    delay?: number
}

export type Inertia = {
    type: "inertia"
    modifyTarget?: (v: number) => number
    bounceStiffness?: number
    bounceDamping?: number
    power?: number
    timeConstant?: number
    restDelta?: number
    min?: number
    max?: number
    from?: number | string
    velocity?: number
    delay?: number
}

export type Keyframes = {
    type: "keyframes"
    values: number[] | string[]
    easings?: Easing[]
    easeAll?: Easing
    elapsed?: number
    duration?: number
    loop?: number
    flip?: number
    yoyo?: number
    from?: number | string
    to?: number | string
    velocity?: number
    delay?: number
}

export type Physics = {
    type: "physics"
    acceleration?: number
    friction?: number
    restSpeed?: number | false
    from?: number | string
    velocity?: number
    delay?: number
}

export type Just = {
    type: "just"
    from?: number | string
    delay?: number
    velocity?: number
}

export type None = {
    type: false
    from?: number | string
    delay?: number
    velocity?: number
}

export type PopmotionTransitionProps =
    | Tween
    | Spring
    | Decay
    | Keyframes
    | Physics
    | Inertia
    | Just

export type TransitionDefinition =
    | Tween
    | Spring
    | Decay
    | Keyframes
    | Physics
    | Inertia
    | Just
    | None

export type TransitionMap = TransitionOrchestration & {
    [key: string]: TransitionDefinition
}

export type Transition =
    | (TransitionOrchestration & TransitionDefinition)
    | (TransitionOrchestration & TransitionMap)

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
type CSSPropertiesWithoutTransition = Omit<CSSProperties, "transition">

export type Target = CSSPropertiesWithoutTransition & {
    x?: number | string
    y?: number | string
    z?: number | string
    rotate?: number | string
    rotateX?: number | string
    rotateY?: number | string
    rotateZ?: number | string
    scale?: number | string
    scaleX?: number | string
    scaleY?: number | string
    scaleZ?: number | string
    skew?: number | string
    skewX?: number | string
    skewY?: number | string
    originX?: number | string
    originY?: number | string
    originZ?: number | string
    pathLength?: number
    pathSpacing?: number
}

export type TargetAndTransition = Target & {
    transition?: Transition
    transitionEnd?: Target
}

export type TargetResolver = (
    props: any,
    current: Target,
    velocity: Target
) => TargetAndTransition

export type Variant = TargetAndTransition | TargetResolver

export type Variants = {
    [key: string]: Variant
}
