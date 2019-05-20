import { RefObject } from "react"

export const isRefObject = (ref: any): ref is RefObject<Element> => {
    return typeof ref === "object" && ref.hasOwnProperty("current")
}
