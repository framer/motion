import * as React from "react"
import { Code } from "../styled"

export const WrongModuleShape = ({ path }: { path: string }) => (
    <p>
        <Code>{path}</Code> does not have a export named <Code>App</Code>
    </p>
)
