import { frame } from "../../frameloop"
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

export class KeyframeResolver<T extends string | number = any, E = any> {
    element: VisualElement<E>
    name: string
    resolvedKeyframes: ResolvedKeyframes<T> | undefined
    unresolvedKeyframes: UnresolvedKeyframes<string | number>
    private onComplete: (resolvedKeyframes: ResolvedKeyframes<T>) => void

    constructor(
        element: VisualElement<E>,
        name: string,
        unresolvedKeyframes: UnresolvedKeyframes<string | number>,
        onComplete: (resolvedKeyframes: ResolvedKeyframes<T>) => void
    ) {
        this.element = element
        this.name = name
        this.unresolvedKeyframes = unresolvedKeyframes
        this.onComplete = onComplete

        toResolve.add(this)

        if (!isScheduled) {
            isScheduled = true
            frame.read(readAllKeyframes)
        }
    }

    needsMeasurement = false

    readKeyframes() {
        const { unresolvedKeyframes, element, name } = this

        if (!element.current) return

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
                    const currentValue = element.getValue(name)!.get()

                    // TODO Clean this up a bit
                    unresolvedKeyframes[0] =
                        currentValue ??
                        (element.readValue(name) as T) ??
                        unresolvedKeyframes[unresolvedKeyframes.length - 1]

                    if (currentValue === undefined) {
                        element.getValue(name)!.set(unresolvedKeyframes[0])
                    }
                } else {
                    unresolvedKeyframes[i] = unresolvedKeyframes[i - 1]
                }
            }
        }

        console.log(unresolvedKeyframes)
    }

    unsetTransforms() {}
    measureInitialState() {}
    renderEndStyles() {}
    measureEndState() {}

    complete() {
        this.onComplete(this.unresolvedKeyframes as ResolvedKeyframes<T>)
        toResolve.delete(this)
    }
}
