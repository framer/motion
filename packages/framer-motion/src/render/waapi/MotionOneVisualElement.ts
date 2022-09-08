import sync from "framesync"
import { invariant } from "hey-listen"
import { createElement } from "react"
import { ReducedMotionConfig } from "../../context/MotionConfigContext"
import { featureDefinitions } from "../../motion/features/definitions"
import { FeatureBundle, FeatureDefinition } from "../../motion/features/types"
import { MotionProps, MotionStyle } from "../../motion/types"
import { TargetAndTransition } from "../../types"
import { env } from "../../utils/process"
import { initPrefersReducedMotion } from "../../utils/reduced-motion"
import {
    hasReducedMotionListener,
    prefersReducedMotion,
} from "../../utils/reduced-motion/state"
import { motionValue, MotionValue } from "../../value"
import { isWillChangeMotionValue } from "../../value/use-will-change/is"
import { isMotionValue } from "../../value/utils/is-motion-value"
import { buildHTMLStyles } from "../html/utils/build-styles"
import { scrapeMotionValuesFromProps } from "../html/utils/scrape-motion-values"
import { ResolvedValues, VisualElementOptions } from "../types"
import { variantPriorityOrder } from "../utils/animation-state"
import {
    isControllingVariants,
    isVariantNode,
} from "../utils/is-controlling-variants"
import { isVariantLabel } from "../utils/is-variant-label"
import { updateMotionValuesFromProps } from "../utils/motion-values"
import { getOrigin, checkTargetForNewValues } from "../utils/setters"

export class MotionOneVisualElement {
    element: HTMLElement | undefined

    private values = new Map<string, MotionValue>()

    private valueSubscriptions = new Map<string, () => void>()

    private prevMotionValues: MotionStyle = {}

    private baseTarget: { [key: string]: string | number | null }

    private parent: MotionOneVisualElement | undefined

    private props: MotionProps

    private latestValues: ResolvedValues

    private renderState: any

    private reducedMotionConfig: ReducedMotionConfig | undefined

    private removeFromTree: VoidFunction | undefined

    private isVariantNode: boolean

    private isControllingVariants: boolean

    blockInitialAnimation: boolean | undefined

    shouldReduceMotion: boolean | null

    variantChildren: Set<MotionOneVisualElement> | undefined

    children = new Set<MotionOneVisualElement>()

    constructor({
        parent,
        props,
        blockInitialAnimation,
        visualState,
        reducedMotionConfig,
    }: VisualElementOptions<HTMLElement>) {
        this.parent = parent as any
        this.props = props
        this.blockInitialAnimation = blockInitialAnimation
        this.latestValues = visualState.latestValues
        this.baseTarget = { ...this.latestValues }
        this.renderState = visualState.renderState
        this.reducedMotionConfig = reducedMotionConfig
        this.isVariantNode = isVariantNode(props)
        this.isControllingVariants = isControllingVariants(props)

        if (this.isVariantNode) {
            this.variantChildren = new Set()
        }

        const { willChange, ...initialMotionValues } =
            scrapeMotionValuesFromProps(props) as any

        for (const key in initialMotionValues) {
            const value = initialMotionValues[key]

            if (this.latestValues[key] !== undefined && isMotionValue(value)) {
                value.set(this.latestValues[key], false)

                if (isWillChangeMotionValue(willChange)) {
                    willChange.add(key)
                }
            }
        }
    }

    render() {
        if (!this.element) return

        this.build()
    }

    getVariant(name: string) {
        return this.props.variants?.[name]
    }

    getDefaultTransition() {
        return this.props.transition
    }

    getProps() {
        return this.props
    }

    setProps(props: MotionProps) {
        this.prevMotionValues = updateMotionValuesFromProps(
            this as any,
            scrapeMotionValuesFromProps(props),
            this.prevMotionValues
        )
    }

    addValue(key: string, value: MotionValue<any>) {
        if (this.values.has(key)) this.removeValue(key)

        this.values.set(key, value)
        this.latestValues[key] = value.get()
        this.bindValue(key, value)
    }

    hasValue(key: string) {
        return this.values.has(key)
    }

    removeValue(key: string) {
        this.values.delete(key)
        this.valueSubscriptions.get(key)?.()
        this.valueSubscriptions.delete(key)
        delete this.latestValues[key]
        delete this.renderState.vars[key]
        delete this.renderState.style[key]
    }

    getValue(key: string, defaultValue?: string | number) {
        let value = this.values.get(key)

        if (value === undefined && defaultValue !== undefined) {
            value = motionValue(defaultValue)
            this.addValue(key, value)
        }

        return value as MotionValue
    }

    forEachValue(callback: any) {
        this.values.forEach(callback)
    }

    bindValue(key: string, value: MotionValue<any>) {
        const removeOnChange = value.onChange((latest) => {
            this.latestValues[key] = latest

            const { onUpdate } = this.props
            onUpdate && sync.update(onUpdate, false, true)
        })

        const removeOnRenderRequest = value.onRenderRequest(this.scheduleRender)

        this.valueSubscriptions.set(key, () => {
            removeOnChange()
            removeOnRenderRequest()
        })
    }

    notifyAnimationStart() {}

    notifyAnimationComplete() {}

    makeTargetAnimatable({
        transition,
        transitionEnd,
        ...target
    }: TargetAndTransition) {
        if (this.element) {
            checkTargetForNewValues(
                this as any,
                target,
                getOrigin(target as any, transition || {}, this as any) as any
            )
        }

        return { transition, transitionEnd, ...target }
    }

    scheduleRender = () => {}

    getClosestVariantNode(): MotionOneVisualElement | undefined {
        return this.isVariantNode ? this : this.parent?.getClosestVariantNode()
    }

    addVariantChild(visualElement: MotionOneVisualElement) {
        const closestVariantNode = this.getClosestVariantNode()
        if (closestVariantNode) {
            closestVariantNode.variantChildren?.add(visualElement)
            return () =>
                closestVariantNode.variantChildren!.delete(visualElement)
        }
    }

    setBaseTarget(key: string, value: number | string) {
        this.baseTarget[key] = value
    }

    getBaseTarget(key: string) {
        const target = this.props.style?.[key]
        if (target !== undefined && !isMotionValue(target)) {
            return target
        }

        return this.baseTarget[key]
    }

    mount(element: HTMLElement) {
        this.element = element

        if (this.isVariantNode && this.parent && !this.isControllingVariants) {
            this.removeFromTree = this.parent?.addVariantChild(this)
        }

        this.values.forEach((value, key) => this.bindValue(key, value))

        if (!hasReducedMotionListener.current) {
            initPrefersReducedMotion()
        }

        this.shouldReduceMotion =
            this.reducedMotionConfig === "never"
                ? false
                : this.reducedMotionConfig === "always"
                ? true
                : prefersReducedMotion.current

        this.parent?.children.add(this)
        this.setProps(this.props)
    }

    unmount() {
        // cancelSync.update(update)
        // cancelSync.render(render)
        this.valueSubscriptions.forEach((remove) => remove())
        this.removeFromTree?.()
        this.parent?.children.delete(this)
        this.element = undefined
    }

    build() {
        if (!this.element) return

        buildHTMLStyles(
            this.renderState,
            this.latestValues,
            {},
            this.props.transformTemplate
        )
    }

    syncRender() {
        // console.trace()
    }

    notifyUnmount() {
        // console.trace()
    }

    getVariantContext(startAtParent = false):
        | undefined
        | {
              initial?: string | string[]
              animate?: string | string[]
              exit?: string | string[]
              whileHover?: string | string[]
              whileDrag?: string | string[]
              whileFocus?: string | string[]
              whileTap?: string | string[]
          } {
        if (startAtParent) return this.parent && this.parent.getVariantContext()

        if (!isControllingVariants) {
            const context = this.parent
                ? this.parent.getVariantContext() || {}
                : {}
            if (this.props.initial !== undefined) {
                context.initial = this.props.initial as any
            }
            return context
        }

        const context = {}
        for (let i = 0; i < numVariantProps; i++) {
            const name = variantProps[i]
            const prop = this.props[name]

            if (isVariantLabel(prop) || prop === false) {
                context[name] = prop
            }
        }

        return context
    }

    loadFeatures(
        props: MotionProps,
        isStrict?: boolean,
        preloadedFeatures?: FeatureBundle
    ) {
        const featureNames = Object.keys(featureDefinitions)
        const numFeatures = featureNames.length
        const features: JSX.Element[] = []

        /**
         * If we're in development mode, check to make sure we're not rendering a motion component
         * as a child of LazyMotion, as this will break the file-size benefits of using it.
         */
        if (env !== "production" && preloadedFeatures && isStrict) {
            invariant(
                false,
                "You have rendered a `motion` component within a `LazyMotion` component. This will break tree shaking. Import and render a `m` component instead."
            )
        }

        for (let i = 0; i < numFeatures; i++) {
            const name = featureNames[i]
            const { isEnabled, Component } = featureDefinitions[
                name
            ] as FeatureDefinition

            /**
             * It might be possible in the future to use this moment to
             * dynamically request functionality. In initial tests this
             * was producing a lot of duplication amongst bundles.
             */
            if (isEnabled(props) && Component) {
                features.push(
                    createElement(Component, {
                        key: name,
                        ...props,
                        visualElement: this as any,
                    })
                )
            }
        }

        return features
    }
}

const variantProps = ["initial", ...variantPriorityOrder]
const numVariantProps = variantProps.length
