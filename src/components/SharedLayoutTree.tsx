import * as React from "react"

export interface SharedLayoutTreeConfig {
    enabled?: boolean
    layoutOrder?: number
    lead?: boolean
}

export type TreeConfig =
    | {
          treeConfig: SharedLayoutTreeConfig
      }
    | undefined

export const SharedLayoutTreeContext = React.createContext<TreeConfig>(
    undefined
)

// export const SharedLayoutTree = ({
//     enabled,
//     order,
//     lead,
//     present,
//     ...rest
// }: React.PropsWithChildren<{
//     order?: number
//     enabled?: boolean
//     lead?: boolean
//     present?: false | undefined
// }>) => {
//     const config = React.useRef<SharedLayoutTreeConfig>({
//         enabled,
//         layoutOrder: undefined,
//         lead: undefined,
//     })

//     const [forcedUpdate, forceTreeUpdate] = React.useState(0)

//     React.useEffect(() => {
//         const wasLead = config.current.lead

//         config.current.lead = lead
//         config.current.layoutOrder = order
//         config.current.enabled = enabled

//         // Right now this is consumed by Measure components to trigger updates.
//         // Perhaps it can be done in a better way.
//         if (!wasLead && lead) forceTreeUpdate(value => value + 1)
//     }, [enabled, order, lead])

//     return (
//         <SharedLayoutTreeContext.Provider
//             value={{ forcedUpdate, treeConfig: config }}
//             {...rest}
//         />
//     )
// }

type Props = React.PropsWithChildren<{
    order?: number
    enabled?: boolean
    lead?: boolean
    present?: false | undefined
}>

export class SharedLayoutTree extends React.Component<Props, {}> {
    private treeConfig: SharedLayoutTreeConfig = {
        enabled: false,
        layoutOrder: undefined,
        lead: undefined,
    }

    shouldComponentUpdate(prevProps: Props) {
        if (this.props.lead !== undefined && this.props.order !== undefined)
            return (
                (!prevProps.lead && !!this.props.lead) ||
                prevProps.order !== this.props.order
            )

        return true
    }

    render() {
        const { enabled, order: layoutOrder, lead } = this.props
        this.treeConfig = {
            enabled,
            layoutOrder,
            lead,
        }

        return (
            <SharedLayoutTreeContext.Provider
                value={{ treeConfig: this.treeConfig }}
                {...this.props}
            />
        )
    }
}
