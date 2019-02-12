// @public
declare const motion: MotionComponents

// @internal (undocumented)
declare const MotionPluginContext: React.Context<Partial<MotionPlugins>>

// @internal (undocumented)
interface MotionPlugins {
    // (undocumented)
    transformPagePoint: (point: Point) => Point
}

// @internal
declare const MotionPlugins: (
    { children, ...props }: MotionPluginProps
) => JSX.Element

// @public (undocumented)
declare class MotionValue<V = any> {
    // (undocumented)
    constructor(init: V, { transformer, parent }?: Config<V>)
    // (undocumented)
    addChild(config: Config<V>): MotionValue<V>
    // (undocumented)
    addRenderSubscription(subscription: Subscriber<V>): () => boolean
    // (undocumented)
    addUpdateSubscription(subscription: Subscriber<V>): () => boolean
    // (undocumented)
    control(
        controller: ActionFactory,
        config: PopmotionTransitionProps,
        transformer?: Transformer<V>
    ): Promise<{}>
    // (undocumented)
    destroy(): void
    // (undocumented)
    get(): V
    // (undocumented)
    getVelocity(): number
    // (undocumented)
    notifySubscriber: (subscriber: Subscriber<V>) => void
    // (undocumented)
    removeChild(child: MotionValue): void
    // (undocumented)
    scheduleVelocityCheck: () => import("framesync/lib/types").Process
    // (undocumented)
    set(v: V, render?: boolean): void
    // (undocumented)
    setChild: (child: MotionValue<any>) => void
    // (undocumented)
    stop(): void
    // (undocumented)
    subscribeTo(
        subscriptions: Set<Subscriber<V>>,
        subscription: Subscriber<V>
    ): () => boolean
    // (undocumented)
    velocityCheck: ({ timestamp }: FrameData) => void
}

// @public
declare function unwrapMotionValue<V>(value: V | MotionValue<V>): V

// @public (undocumented)
declare const useAnimation: (
    variants?: Variants | undefined,
    defaultTransition?:
        | import("../types").TransitionMap
        | (import("../types").TransitionOrchestration &
              import("../types").Tween)
        | (import("../types").TransitionOrchestration &
              import("../types").Spring)
        | (import("../types").TransitionOrchestration &
              import("../types").Decay)
        | (import("../types").TransitionOrchestration &
              import("../types").Inertia)
        | (import("../types").TransitionOrchestration &
              import("../types").Keyframes)
        | (import("../types").TransitionOrchestration &
              import("../types").Physics)
        | (import("../types").TransitionOrchestration & import("../types").Just)
        | (import("../types").TransitionOrchestration & import("../types").None)
        | undefined
) => AnimationManager

// @public
declare const useCycle: <T>(
    items: T[],
    initialIndex?: number
) => [T, (i?: any) => void]

// @public (undocumented)
declare const useGestures: <P extends GestureHandlers>(
    props: P,
    ref: RefObject<Element>
) => void

// @public
declare const useMotionValue: <T>(init: T) => MotionValue<T>

// @public (undocumented)
declare function usePanGesture(
    handlers: PanHandlers,
    ref: RefObject<Element>
): undefined

// @public (undocumented)
declare function usePanGesture(
    handlers: PanHandlers
): {
    // (undocumented)
    onPointerDown: EventHandler
}

// @public (undocumented)
declare function useTapGesture(
    handlers: TapHandlers & ControlsProp
): {
    // (undocumented)
    onPointerDown: EventHandler
}

// @public (undocumented)
declare function useTapGesture(
    handlers: TapHandlers & ControlsProp,
    ref: RefObject<Element>
): undefined

// @public (undocumented)
declare function useTransformedValue(
    value: MotionValue,
    transform: Transformer_2
): MotionValue

// @public (undocumented)
declare function useTransformedValue(
    value: MotionValue<number>,
    from: number[],
    to: any[],
    options?: TransformerOptions
): MotionValue

// @public
declare const useViewportScrollValues: () => {
    // (undocumented)
    scrollX: import(".").MotionValue<number>
    // (undocumented)
    scrollY: import(".").MotionValue<number>
    // (undocumented)
    scrollXProgress: import(".").MotionValue<number>
    // (undocumented)
    scrollYProgress: import(".").MotionValue<number>
}

// (No @packageDocumentation comment for this package)
