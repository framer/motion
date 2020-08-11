import * as React from "react"
import {
    SharedLayoutContext,
    SharedLayoutSyncMethods,
} from "./SharedLayoutContext"
import { HTMLVisualElement } from "render/dom/HTMLVisualElement"
import { Presence } from "./types"

export interface SharedLayoutTreeProps {
    /**
     * @public
     */
    children: React.ReactNode

    /**
     * Are the children of the tree valid targets when computing lead and follow.
     */
    isPresent: boolean | undefined
    /**
     * Are the children of the tree valid targets when computing lead and follow.
     */
    isValidTree: boolean

    /**
     * What priority should children of this tree take when determining the lead and follow.
     */
    layoutOrder: number

    isLead: boolean
}

interface SyncProps extends SharedLayoutTreeProps {
    syncContext: SharedLayoutSyncMethods
}

export class LayoutTree extends React.Component<SyncProps> {
    /**
     * A list of all the children in the tree
     */
    children = new Set<HTMLVisualElement>()

    isPresent? = true
    isValid = true
    layoutOrder = 0

    /**
     * The methods provided to all children in the shared layout tree.
     */
    syncContext: SharedLayoutSyncMethods = {
        ...this.props.syncContext,
        register: child => this.addChild(child as HTMLVisualElement),
        remove: child => this.removeChild(child as HTMLVisualElement),
    }

    componentDidMount() {
        // register the tree object with the parent sync context
        this.layoutOrder = this.props.layoutOrder
        this.props.syncContext.register(this)
    }

    componentWillUnmount() {
        this.props.syncContext.remove(this)
    }

    addChild(child: HTMLVisualElement) {
        this.children.add(child)
        child.presence = Presence.Entering
    }

    removeChild(child: HTMLVisualElement) {
        this.children.delete(child)
    }

    shouldComponentUpdate(prevProps: SharedLayoutTreeProps) {
        const { isPresent, isValidTree, layoutOrder, isLead } = this
            .props as SharedLayoutTreeProps

        this.isPresent = isPresent
        this.isValid = isValidTree
        if (layoutOrder === undefined) return true

        const hasOrderChanged = prevProps.layoutOrder !== layoutOrder
        // const hasPresenceChanged = prevProps.isPresent !== isPresent
        const hasBecomeLead = isLead && !prevProps.isLead

        if (hasBecomeLead || hasOrderChanged)
            this.children.forEach(child => (child.presence = Presence.Entering))

        if (hasBecomeLead) return true

        return false
    }

    render() {
        return (
            <SharedLayoutContext.Provider value={this.syncContext}>
                {this.props.children}
            </SharedLayoutContext.Provider>
        )
    }
}

export const SharedLayoutTree = (props: SharedLayoutTreeProps) => {
    const syncContext = React.useContext(
        SharedLayoutContext
    ) as SharedLayoutSyncMethods
    return <LayoutTree {...props} syncContext={syncContext} />
}
