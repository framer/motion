import { isValidElement, Children, ReactElement, ReactNode } from "react"

export type ComponentKey = string | number

export const getChildKey = (child: ReactElement<any>): ComponentKey =>
    child.key || ""

export function onlyElements(children: ReactNode): ReactElement<any>[] {
    const filtered: ReactElement<any>[] = []

    // We use forEach here instead of map as map mutates the component key by preprending `.$`
    Children.forEach(children, (child) => {
        if (isValidElement(child)) filtered.push(child)
    })

    return filtered
}

export function arrayEquals(a: any[], b: any[]) {
    if (a.length !== b.length) return false

    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false
    }

    return true
}
