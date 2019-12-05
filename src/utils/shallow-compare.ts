export function shallowCompare(next: any[], prev: any[] | null) {
    if (prev === null) return false

    const prevLength = prev.length

    if (prevLength !== next.length) return false

    for (let i = 0; i < prevLength; i++) {
        if (prev[i] !== next[i]) return false
    }

    return true
}
