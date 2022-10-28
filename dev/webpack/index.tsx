import * as React from "react"
import { createRoot } from "react-dom/client"
import { Example, ExampleList } from "./examples"
import { Test } from "./tests"
import { App as Timeline } from "./timeline"

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

    const timeline = url.searchParams.get("timeline")

    if (timeline) {
        return <Timeline />
    }

    return <ExampleList />
}

createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)
