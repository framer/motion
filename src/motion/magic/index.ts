import { MagicContextProvider } from "./Magic"
import { FunctionalComponentDefinition } from "../functionality/types"
import { MotionProps } from "../types"

export const magic: FunctionalComponentDefinition = {
    key: "magic",
    shouldRender: ({ magic, magicId }: MotionProps) => {
        const hasMagicProps = magic !== undefined || magicId !== undefined
        return hasMagicProps && typeof window !== "undefined"
    },
    Component: MagicContextProvider,
}
