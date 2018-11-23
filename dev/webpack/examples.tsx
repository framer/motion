import * as React from "react"
import { basename, extname } from "path"
import { Container } from "../styled"

const context = require["context"]("../examples", true, /\.(tsx?)$/)

const fileName = (pathName: string) => {
    return basename(pathName, extname(pathName))
}

const style: React.CSSProperties = {
    font: "16px/1.6em 'Helvetica Neue'",
    textRendering: "optimizeLegibility",
    margin: "64px",
}

const Code: React.SFC = props => {
    return <span style={{ fontFamily: "Menlo", color: "grey", fontSize: "90%" }}>{props.children}</span>
}

const ExampleList = () => {
    return (
        <div style={style}>
            <h2>Framer Examples</h2>
            <p>
                You can edit any of these in the <Code>dev/examples</Code> folder.
            </p>
            <ul>
                {context.keys().map((name: string) => (
                    <li key={name}>
                        <a href={`?example=${fileName(name)}`}>{fileName(name)}</a>{" "}
                        <Code>{name.replace("./", "examples/")}</Code>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export class App extends React.Component {
    render() {
        const url = new URL(window.location.href)
        const example = url.searchParams.get("example")

        if (!example) {
            return <ExampleList />
        }

        const exampleName = fileName(example)
        const exampleApp = require(`../examples/${exampleName}`)

        if (exampleApp) {
            if (exampleApp.App) {
                // Update the document title to the example
                document.title = exampleName

                return (
                    <Container>
                        <exampleApp.App />
                    </Container>
                )
            } else {
                return (
                    <p>
                        <Code>examples/{example}</Code> does not have a export named <Code>App</Code>
                    </p>
                )
            }
        }

        return <ExampleList />
    }
}
