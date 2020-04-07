import { MagicContextProvider } from "./Magic"
import { MotionFeature } from "../types"
import { MotionProps } from "../../types"

export const magic: MotionFeature = {
    key: "magic",
    shouldRender: ({ animate, layoutId }: MotionProps) => {
        const hasMagicProps =
            typeof animate === "boolean" || layoutId !== undefined
        return hasMagicProps && typeof window !== "undefined"
    },
    Component: MagicContextProvider,
}
