import { RefObject } from "react"
import { Constraints } from "../behaviours/use-draggable"

export const isRefObject = (
    ref: Constraints | RefObject<Element>
): ref is RefObject<Element> => {
    return ref.hasOwnProperty("current")
}
