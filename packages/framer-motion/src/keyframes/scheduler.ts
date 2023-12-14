import type { Keyframes } from "./Keyframes"

const keyframesToResolve = new Set<Keyframes<any>>()
let isScheduled = false

export function registerKeyframes<T extends string | number>(
    keyframes: Keyframes<T>
) {
    keyframesToResolve.add(keyframes)

    if (!isScheduled) {
        isScheduled = true
    }
}

export function deregisterKeyframes<T extends string | number>(
    keyframes: Keyframes<T>
) {
    keyframesToResolve.delete(keyframes)

    if (keyframesToResolve.size === 0) {
        isScheduled = false
    }
}
