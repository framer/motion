import { FeatureProps } from "../features/types"

export const makeRenderlessComponent = <P = FeatureProps>(hook: Function) => (
    props: P
) => {
    hook(props)
    return null
}
