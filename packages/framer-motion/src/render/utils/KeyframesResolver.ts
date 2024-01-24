import { cancelFrame, frame } from "../../frameloop"
import { MotionValue } from "../../value"
import type { VisualElement } from "../VisualElement"

export type UnresolvedKeyframes<T extends string | number> = Array<T | null>

export type ResolvedKeyframes<T extends string | number> = Array<T>

const toResolve = new Set<KeyframeResolver>()
let isScheduled = false
let needsMeasurement = false

function measureAllKeyframes() {
    if (needsMeasurement) {
        toResolve.forEach((resolver) => {
            resolver.needsMeasurement && resolver.unsetTransforms()
        })
        toResolve.forEach((resolver) => {
            resolver.needsMeasurement && resolver.measureInitialState()
        })
        toResolve.forEach((resolver) => {
            resolver.needsMeasurement && resolver.renderEndStyles()
        })
        toResolve.forEach((resolver) => {
            resolver.needsMeasurement && resolver.measureEndState()
        })
    }

    needsMeasurement = false
    isScheduled = false

    toResolve.forEach((resolver) => {
        resolver.complete()
    })

    toResolve.clear()
}

function readAllKeyframes() {
    toResolve.forEach((resolver) => {
        resolver.readKeyframes()

        if (resolver.needsMeasurement) {
            needsMeasurement = true
        }
    })

    frame.resolveKeyframes(measureAllKeyframes)
}

export function flushKeyframeResolvers() {
    readAllKeyframes()
    measureAllKeyframes()

    cancelFrame(readAllKeyframes)
    cancelFrame(measureAllKeyframes)
}

export type OnKeyframesResolved<T extends string | number> = (
    resolvedKeyframes: ResolvedKeyframes<T>
) => void

type ReadValue = (
    target?: string | number | null
) => string | number | undefined | null

export class KeyframeResolver<T extends string | number = any> {
    element: VisualElement<any>
    name?: string
    resolvedKeyframes: ResolvedKeyframes<T> | undefined
    unresolvedKeyframes: UnresolvedKeyframes<string | number>
    motionValue?: MotionValue<T>
    readValueFromInstance?: ReadValue
    private onComplete: OnKeyframesResolved<T>

    constructor(
        unresolvedKeyframes: UnresolvedKeyframes<string | number>,
        onComplete: OnKeyframesResolved<T>,
        name?: string,
        motionValue?: MotionValue<T>,
        readValueFromInstance?: ReadValue
    ) {
        this.unresolvedKeyframes = unresolvedKeyframes
        this.onComplete = onComplete
        this.name = name
        this.motionValue = motionValue
        this.readValueFromInstance = readValueFromInstance

        toResolve.add(this)

        if (!isScheduled) {
            isScheduled = true
            frame.read(readAllKeyframes)
        }
    }

    needsMeasurement = false

    readKeyframes() {
        const {
            unresolvedKeyframes,
            readValueFromInstance,
            name,
            motionValue,
        } = this

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
                    } else if (readValueFromInstance && name) {
                        const valueAsRead = readValueFromInstance(finalKeyframe)

                        if (valueAsRead !== undefined) {
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
        this.onComplete(this.unresolvedKeyframes as ResolvedKeyframes<T>)
        toResolve.delete(this)
    }

    cancel() {
        toResolve.delete(this)
    }
}
