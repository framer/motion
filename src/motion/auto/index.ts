import { Auto } from "./Auto"
import { FunctionalComponentDefinition } from "../functionality/types"
import { MotionProps } from "../types"

// TODO: Re-implement positionTransition and layoutTransition checks if this isn't 2.0
export const auto: FunctionalComponentDefinition = {
    key: "auto",
    shouldRender: ({ auto }: MotionProps) =>
        !!auto && typeof window !== "undefined",
    Component: Auto,
}
