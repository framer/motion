import { SharedLayoutContextProvider } from "./Auto"
import { MotionFeature } from "../types"
import { MotionProps } from "../../types"

export const Auto: MotionFeature = {
    key: "auto",
    shouldRender: ({ animate, layoutId }: MotionProps) => {
        const hasMagicProps =
            typeof animate === "boolean" || layoutId !== undefined
        return hasMagicProps && typeof window !== "undefined"
    },
    Component: SharedLayoutContextProvider,
}
