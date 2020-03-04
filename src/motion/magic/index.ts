import { Magic } from "./Magic"
import { FunctionalComponentDefinition } from "../functionality/types"
import { MotionProps } from "../types"

export const magic: FunctionalComponentDefinition = {
    key: "magic",
    shouldRender: ({ magic }: MotionProps) =>
        !!magic && typeof window !== "undefined",
    Component: Magic,
}
