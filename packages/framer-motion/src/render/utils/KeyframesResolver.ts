import { frame } from "../../frameloop"
import { MotionValue } from "../../value"
import type { VisualElement } from "../VisualElement"

export type UnresolvedKeyframes<T extends string | number> = Array<T | null>

export type ResolvedKeyframes<T extends string | number> = Array<T>

const toResolve = new Set<KeyframeResolver>()
let isScheduled = false
let anyNeedsMeasurement = false

function measureAllKeyframes() {
    if (anyNeedsMeasurement) {
        // Write
        toResolve.forEach((resolver) => {
            resolver.needsMeasurement && resolver.unsetTransforms()
        })

        // Read
        toResolve.forEach((resolver) => {
            resolver.needsMeasurement && resolver.measureInitialState()
        })

        // Write
        toResolve.forEach((resolver) => {
            resolver.needsMeasurement && resolver.renderEndStyles()
        })

        // Read
        toResolve.forEach((resolver) => {
            resolver.needsMeasurement && resolver.measureEndState()
        })
    }

    anyNeedsMeasurement = false
    isScheduled = false

    toResolve.forEach((resolver) => resolver.complete())

    toResolve.clear()
}

function readAllKeyframes() {
    toResolve.forEach((resolver) => {
        resolver.readKeyframes()

        if (resolver.needsMeasurement) {
            anyNeedsMeasurement = true
        }
    })
}

export function flushKeyframeResolvers() {
    console.log("flushing  keyframe resolvers")
    readAllKeyframes()
    measureAllKeyframes()
}

export type OnKeyframesResolved<T extends string | number> = (
    resolvedKeyframes: ResolvedKeyframes<T>,
    finalKeyframe: T
) => void

export class KeyframeResolver<T extends string | number = any> {
    protected element?: VisualElement<any>
    protected unresolvedKeyframes: UnresolvedKeyframes<string | number>
    name?: string

    finalKeyframe?: T

    private motionValue?: MotionValue<T>
    private onComplete: OnKeyframesResolved<T>

    /**
     * Track whether this resolver has completed. Once complete, it never
     * needs to attempt keyframe resolution again.
     */
    private isComplete = false

    /**
     * Track whether this resolver is async. If it is, it'll be added to the
     * resolver queue and flushed in the next frame. Resolvers that aren't going
     * to trigger read/write thrashing don't need to be async.
     */
    private isAsync = false

    /**
     * Track whether this resolver needs to perform a measurement
     * to resolve its keyframes.
     */
    needsMeasurement = false

    /**
     * Track whether this resolver is currently scheduled to resolve
     * to allow it to be cancelled and resumed externally.
     */
    isScheduled = false

    constructor(
        unresolvedKeyframes: UnresolvedKeyframes<string | number>,
        onComplete: OnKeyframesResolved<T>,
        name?: string,
        motionValue?: MotionValue<T>,
        element?: VisualElement<any>,
        isAsync = false
    ) {
        this.unresolvedKeyframes = [...unresolvedKeyframes]
        this.onComplete = onComplete
        this.name = name
        this.motionValue = motionValue
        this.element = element
        this.isAsync = isAsync
    }

    scheduleResolve() {
        this.isScheduled = true
        if (this.isAsync) {
            toResolve.add(this)

            if (!isScheduled) {
                isScheduled = true
                frame.read(readAllKeyframes)
                frame.resolveKeyframes(measureAllKeyframes)
            }
        } else {
            this.readKeyframes()
            this.complete()
        }
    }

    readKeyframes() {
        const { unresolvedKeyframes, name, element, motionValue } = this

        /**
         * If a keyframe is null, we hydrate it either by reading it from
         * the instance, or propagating from previous keyframes.
         */
        for (let i = 0; i < unresolvedKeyframes.length; i++) {
            if (unresolvedKeyframes[i] === null) {
                /**
                 * If the first keyframe is null, we need to find its value by sampling the element
                 */
                if (i === 0) {
                    const currentValue = motionValue?.get()

                    const finalKeyframe =
                        unresolvedKeyframes[unresolvedKeyframes.length - 1]

                    if (currentValue !== undefined) {
                        unresolvedKeyframes[0] = currentValue
                    } else if (element && name) {
                        const valueAsRead = element.readValue(
                            name,
                            finalKeyframe
                        )

                        if (valueAsRead !== undefined && valueAsRead !== null) {
                            unresolvedKeyframes[0] = valueAsRead
                        }
                    }

                    if (unresolvedKeyframes[0] === undefined) {
                        unresolvedKeyframes[0] = finalKeyframe
                    }

                    if (motionValue && currentValue === undefined) {
                        motionValue.set(unresolvedKeyframes[0] as T)
                    }
                } else {
                    unresolvedKeyframes[i] = unresolvedKeyframes[i - 1]
                }
            }
        }
    }

    unsetTransforms() {}
    measureInitialState() {}
    renderEndStyles() {}
    measureEndState() {}

    complete() {
        this.isComplete = true

        this.onComplete(
            this.unresolvedKeyframes as ResolvedKeyframes<T>,
            this.finalKeyframe as T
        )
        toResolve.delete(this)
    }

    cancel() {
        if (!this.isComplete) {
            this.isScheduled = false
            toResolve.delete(this)
        }
    }

    resume() {
        if (!this.isComplete) this.scheduleResolve()
    }
}
