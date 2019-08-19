import * as React from "react"
import { fileName } from "../inc/file-name"
import { WrongModuleShape } from "./WrongModuleShape"

export const Test = ({ id }: { id: string }) => {
    const name = fileName(id)
    const targetModule = require(`../tests/${name}`)
    const path = `tests/${name}`

    if (!targetModule.App) {
        return <WrongModuleShape path={path} />
    }

    document.title = name

    return <targetModule.App />
}
