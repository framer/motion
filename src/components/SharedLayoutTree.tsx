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
