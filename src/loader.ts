// This is the main entry in webpack and runs checks if we are stup correctly

import * as React from "react"

if (!React) {
    throw Error("Framer needs React as an external dependency.")
}

import * as ReactDOM from "react-dom"

if (!ReactDOM) {
    throw Error("Framer needs ReactDOM as an external dependency.")
}
