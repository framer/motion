import { LayoutMetadata } from "./types"

const metadata = new WeakMap<any, LayoutMetadata>()

export function getMetadata(child: any): LayoutMetadata {
    return (metadata.get(child) as LayoutMetadata) || {}
}

export function setMetadata(child: any, newData: Partial<LayoutMetadata>) {
    const data = getMetadata(child)
    metadata.set(child, { ...data, ...newData })
}
