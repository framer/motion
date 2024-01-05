import { MutableRefObject } from "./safe-react-types"

export function isRefObject<E = any>(ref: any): ref is MutableRefObject<E> {
    return (
        ref &&
        typeof ref === "object" &&
        Object.prototype.hasOwnProperty.call(ref, "current")
    )
}
