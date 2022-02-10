import * as React from "react"
import * as ReactDOM from "react-dom"
import { Example, ExampleList } from "./examples"
import { Test } from "./tests"

const App = () => {
    const url = new URL(window.location.href)
    const example = url.searchParams.get("example")

    if (example) {
        return <Example id={example} />
    }

    const test = url.searchParams.get("test")

    if (test) {
        return <Test id={test} />
    }

    return <ExampleList />
}

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById("root")
)
