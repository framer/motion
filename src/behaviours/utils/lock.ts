export function createLock(name: string) {
    let lock: null | string = null
    return (): (() => void) | false => {
        const openLock = (): void => {
            lock = null
        }
        if (lock === null) {
            lock = name
            return openLock
        }
        console.log(`lock ${name} is closed`)
        return false
    }
}
