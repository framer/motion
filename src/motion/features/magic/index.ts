import { MagicContextProvider } from "./Magic"
import { MotionFeature } from "../types"
import { MotionProps } from "../../types"

export const magic: MotionFeature = {
    key: "magic",
    shouldRender: ({ magic, sharedId }: MotionProps) => {
        const hasMagicProps = magic !== undefined || sharedId !== undefined
        return hasMagicProps && typeof window !== "undefined"
    },
    Component: MagicContextProvider,
}
