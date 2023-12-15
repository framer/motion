import { frame } from "../../frameloop"

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

export abstract class KeyframeResolver<T extends string | number = any> {
    resolvedKeyframes: ResolvedKeyframes<T> | undefined
    unresolvedKeyframes: UnresolvedKeyframes<string | number>
    private onComplete: (resolvedKeyframes: ResolvedKeyframes<T>) => void

    constructor(
        unresolvedKeyframes: UnresolvedKeyframes<string | number>,
        onComplete: (resolvedKeyframes: ResolvedKeyframes<T>) => void
    ) {
        this.unresolvedKeyframes = unresolvedKeyframes
        this.onComplete = onComplete

        toResolve.add(this)

        if (!isScheduled) {
            isScheduled = true
            frame.read(readAllKeyframes)
        }
    }

    needsMeasurement = false

    abstract readKeyframes(): void
    abstract unsetTransforms(): void
    abstract measureInitialState(): void
    abstract renderEndStyles(): void
    abstract measureEndState(): void

    complete() {
        this.onComplete(this.unresolvedKeyframes as ResolvedKeyframes<T>)
        toResolve.delete(this)
    }
}
