import { Action, action } from "popmotion"

/**
 * A Popmotion action that accepts a single `to` prop. When it starts, it immediately
 * updates with `to` and then completes. By using this we can compose instant transitions
 * in with the same logic that applies `delay` or returns a `Promise` etc.
 */
export const just = ({ to }: { to: string | number }): Action => {
    return action(({ update, complete }) => {
        update(to)
        complete()
    })
}
