import { FeatureProps, ReactFeatureDefinition } from "../features/types"

export const makeRenderlessComponent = (
    hook: Function
): ReactFeatureDefinition => ({
    type: "react",
    feature: (props: FeatureProps) => {
        hook(props)
        return null
    },
})
