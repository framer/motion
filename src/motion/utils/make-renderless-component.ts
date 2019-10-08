import { FunctionalProps } from "../functionality/types"

export const makeRenderlessComponent = <P = FunctionalProps>(
    hook: Function
) => (props: P) => {
    hook(props)
    return null
}
