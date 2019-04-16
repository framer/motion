import { FunctionalProps } from "../functionality/types"

export const makeHookComponent = <P = FunctionalProps>(hook: Function) => (
    props: P
) => {
    hook(props)
    return null
}
