import * as Three from "three"
import { threeVisualElement } from "./three-visual-element"
import { VisualElementOptions } from "../types"

export function createThreeVisualElement() {
    return (
        _isStatic: boolean,
        options: VisualElementOptions<Three.Object3D>
    ) => {
        return threeVisualElement(options, {})
    }
}
