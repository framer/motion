import { AxisBox2D } from "../../../types/geometry"

export interface LayoutProps {
    /**
     * @public
     */
    layout?: boolean

    /**
     * @public
     */
    layoutId?: string

    /**
     * @internal
     */
    onViewportBoxUpdate?: (box: AxisBox2D) => void
}
