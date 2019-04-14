import { FunctionalProps } from "../functionality/types"

export const makeHookComponent = (hook: Function) => (
    props: FunctionalProps
) => {
    hook(props)
    return null
}
