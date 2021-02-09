import { MutableRefObject } from "react"

export function isRefObject<E = any>(ref: any): ref is MutableRefObject<E> {
    return typeof ref === "object" && ref.hasOwnProperty("current")
}
