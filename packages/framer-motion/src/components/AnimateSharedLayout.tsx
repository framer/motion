import * as React from "react"
import { useConstant } from "../utils/use-constant"
import { LayoutGroup } from "./LayoutGroup"

let id = 0
export const AnimateSharedLayout: React.FC<{children: React.ReactNode}> = ({ children }) => (
    <LayoutGroup id={useConstant(() => `asl-${id++}`)}>{children}</LayoutGroup>
)
