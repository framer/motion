import { Ref } from "react"
import { MotionProps } from "../motion/types"
import { Transition, Variant, Variants } from "../types"
import { AxisBox2D, BoxDelta, Point2D } from "../types/geometry"
import { MotionValue } from "../value"
import { DOMVisualElementOptions } from "./dom/types"

export interface VisualElement<E = any> {
    depth: number
    current: E | null
    getInstance(): E | null
    path: VisualElement[]
    addChild(child: VisualElement<unknown>): () => void
    ref: Ref<E>
    hasValue(key: string): boolean
    addValue(key: string, value: MotionValue<any>): void
    removeValue(key: string): void
    getValue(key: string): undefined | MotionValue
    getValue(key: string, defaultValue: string | number): MotionValue
    getValue(
        key: string,
        defaultValue?: string | number
    ): undefined | MotionValue
    forEachValue(callback: (value: MotionValue, key: string) => void): void
    readValue(key: string): string | number | undefined | null
    scheduleRender(): void
    updateOptions(options: VisualElementOptions): void
    getVariant(name: string): Variant | undefined
    getVariantData(): any
    getDefaultTransition(): Transition | undefined
    scheduleUpdateLayoutProjection(): void
    suspendHoverEvents(): void
    withoutTransform(callback: () => void): void
    updateLayoutProjection(): void
    notifyAnimationStart(): void
    notifyAnimationComplete(): void
}

export interface VisualElementConfig<E, MutableState> {
    initMutableState(): MutableState
    build(
        latest: ResolvedValues,
        mutableState: MutableState,
        projection: Projection,
        options: DOMVisualElementOptions
    ): void
    readNativeValue(
        instance: E,
        key: string
    ): string | number | null | undefined
    resetTransform(
        element: VisualElement<E>,
        instance: E,
        options: DOMVisualElementOptions
    ): void
    restoreTransform(instance: E, mutableState: MutableState): void
    render(instance: E, mutableState: MutableState): void
    onRemoveValue(key: string, mutableState: MutableState): void
}

export interface VisualElementOptions {
    defaultTransition?: Transition
    onAnimationStart?: MotionProps["onAnimationStart"]
    onAnimationComplete?: MotionProps["onAnimationComplete"]
    variants?: Variants
    variantData?: any
}

export interface Projection {
    isEnabled: boolean

    /**
     * The measured bounding box as it exists on the page with no transforms applied.
     *
     * To calculate the visual output of a component in any given frame, we:
     *
     *   1. box -> boxCorrected
     *      Apply the delta between the tree transform when the box was measured and
     *      the tree transform in this frame to the box
     *   2. targetBox -> targetBoxFinal
     *      Apply the VisualElement's `transform` properties to the targetBox
     *   3. Calculate the delta between boxCorrected and targetBoxFinal and apply
     *      it as a transform style.
     */
    layout: AxisBox2D

    /**
     * The `box` layout with transforms applied from up the
     * tree. We use this as the final bounding box from which we calculate a transform
     * delta to our desired visual position on any given frame.
     *
     * This is considered mutable to avoid object creation on each frame.
     */
    layoutCorrected: AxisBox2D

    /**
     * The visual target we want to project our component into on a given frame
     * before applying transforms defined in `animate` or `style`.
     *
     * This is considered mutable to avoid object creation on each frame.
     */
    target: AxisBox2D

    /**
     * The visual target we want to project our component into on a given frame
     * before applying transforms defined in `animate` or `style`.
     *
     * This is considered mutable to avoid object creation on each frame.
     */
    targetFinal: AxisBox2D

    /**
     * The overall scale of the local coordinate system as transformed by all parents
     * of this component. We use this for scale correction on our calculated layouts
     * and scale-affected values like `boxShadow`.
     *
     * This is considered mutable to avoid object creation on each frame.
     */
    treeScale: Point2D

    /**
     * The delta between the boxCorrected and the desired
     * targetBox (before user-set transforms are applied). The calculated output will be
     * handed to the renderer and used as part of the style correction calculations, for
     * instance calculating how to display the desired border-radius correctly.
     *
     * This is considered mutable to avoid object creation on each frame.
     */
    delta: BoxDelta

    /**
     * The delta between the boxCorrected and the desired targetBoxFinal. The calculated
     * output will be handed to the renderer and used to project the boxCorrected into
     * the targetBoxFinal.
     *
     * This is considered mutable to avoid object creation on each frame.
     */
    deltaFinal: BoxDelta
}

export interface InitialVisualElementOptions<E = any>
    extends VisualElementOptions {
    ref: Ref<E>
    parent?: VisualElement<unknown>
}

export type ExtendVisualElement<
    Extended extends VisualElement,
    Element = any
> = (element: VisualElement<Element>) => Extended

export type UseVisualElement<E, P = MotionProps> = (
    Component: string | React.ComponentType<P>,
    props: MotionProps & P,
    isStatic?: boolean,
    ref?: Ref<E>
) => VisualElement

/**
 * A generic set of string/number values
 */
export interface ResolvedValues {
    [key: string]: string | number
}
