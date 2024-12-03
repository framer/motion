import { noop } from "./noop"

export type DevMessage = (check: boolean, message: string) => void

let warning: DevMessage = noop
let invariant: DevMessage = noop

if (process.env.NODE_ENV !== "production") {
    warning = (check, message) => {
        if (!check && typeof console !== "undefined") {
            console.warn(message)
        }
    }

    invariant = (check, message) => {
        if (!check) {
            throw new Error(message)
        }
    }
}

export { warning, invariant }
