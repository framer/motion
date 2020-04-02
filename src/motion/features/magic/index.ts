import { MagicContextProvider } from "./Magic"
import { MotionFeature } from "../types"
import { MotionProps } from "../../types"

export const magic: MotionFeature = {
    key: "magic",
    shouldRender: ({ magic, magicId }: MotionProps) => {
        const hasMagicProps = magic !== undefined || magicId !== undefined
        return hasMagicProps && typeof window !== "undefined"
    },
    Component: MagicContextProvider,
}
