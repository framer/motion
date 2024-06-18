import { camelToDash } from "../../render/dom/utils/camel-to-dash"
import { isCSSVariableName } from "../../render/dom/utils/is-css-variable"
import { transformProps } from "../../render/html/utils/transform"

export function getWillChangeName(name: string) {
    let memberName: string | undefined

    if (transformProps.has(name)) {
        memberName = "transform"
    } else if (
        !name.startsWith("origin") &&
        !isCSSVariableName(name) &&
        name !== "willChange"
    ) {
        memberName = camelToDash(name)
    }

    return memberName
}
