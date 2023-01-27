import { calcAngularFreq } from "./find"

export type SpringResolver = (
    target: number,
    initialDelta: number,
    initialVelocity: number,
    dampingRatio: number,
    undampedAngularFreq: number,
    time: number
) => number

export const underdampedSpring: SpringResolver = (
    target,
    initialDelta,
    initialVelocity,
    dampingRatio,
    undampedAngularFreq,
    time
) => {
    const angularFreq = calcAngularFreq(undampedAngularFreq, dampingRatio)
    const envelope = Math.exp(-dampingRatio * undampedAngularFreq * time)

    return (
        target -
        envelope *
            (((initialVelocity +
                dampingRatio * undampedAngularFreq * initialDelta) /
                angularFreq) *
                Math.sin(angularFreq * time) +
                initialDelta * Math.cos(angularFreq * time))
    )
}

export const criticallyDampedSpring: SpringResolver = (
    target,
    initialDelta,
    initialVelocity,
    _dampingRatio,
    undampedAngularFreq,
    time
) => {
    return (
        target -
        Math.exp(-undampedAngularFreq * time) *
            (initialDelta +
                (initialVelocity + undampedAngularFreq * initialDelta) * time)
    )
}

export const overdampedSpring: SpringResolver = (
    target,
    initialDelta,
    initialVelocity,
    dampingRatio,
    undampedAngularFreq,
    time
) => {
    const dampedAngularFreq =
        undampedAngularFreq * Math.sqrt(dampingRatio * dampingRatio - 1)
    const envelope = Math.exp(-dampingRatio * undampedAngularFreq * time)

    // When performing sinh or cosh values can hit Infinity so we cap them here
    const freqForT = Math.min(dampedAngularFreq * time, 300)

    return (
        target -
        (envelope *
            ((initialVelocity +
                dampingRatio * undampedAngularFreq * initialDelta) *
                Math.sinh(freqForT) +
                dampedAngularFreq * initialDelta * Math.cosh(freqForT))) /
            dampedAngularFreq
    )
}
