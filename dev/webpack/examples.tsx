import * as React from "react"
import { fileName } from "../inc/file-name"
import { Container, Code } from "../styled"
import { WrongModuleShape } from "./WrongModuleShape"

const context = require["context"]("../examples", true, /\.(tsx?)$/)

const style: React.CSSProperties = {
    font: "16px/1.6em 'Helvetica Neue'",
    textRendering: "optimizeLegibility",
    margin: "64px",
}

export const ExampleList = () => {
    return (
        <div style={style}>
            <h2>Framer Examples</h2>
            <p>
                You can edit any of these in the <Code>dev/examples</Code>{" "}
                folder.
            </p>
            <ul>
                {context.keys().map((name: string) => (
                    <li key={name}>
                        <a href={`?example=${fileName(name)}`}>
                            {fileName(name)}
                        </a>{" "}
                        <Code>{name.replace("./", "examples/")}</Code>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export const Example = ({ id }: { id: string }) => {
    const name = fileName(id)
    const targetModule = require(`../examples/${name}`)

    if (!targetModule.App) {
        return <WrongModuleShape path={`examples/${name}`} />
    }

    document.title = name

    return (
        <Container>
            <targetModule.App />
        </Container>
    )
}
