import * as React from "react"
import { useConstant } from "../utils/use-constant"
import { LayoutGroup } from "./LayoutGroup"

let id = 0
export const AnimateSharedLayout: React.FunctionComponent<React.PropsWithChildren> = ({ children }) => (
    <LayoutGroup id={useConstant(() => `asl-${id++}`)}>{children}</LayoutGroup>
)
