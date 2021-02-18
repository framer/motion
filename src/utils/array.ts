export function addUniqueItem<T>(arr: T[], item: T) {
    arr.indexOf(item) === -1 && arr.push(item)
}

export function removeItem<T>(arr: T[], item: T) {
    const index = arr.indexOf(item)
    index > -1 && arr.splice(index, 1)
}
