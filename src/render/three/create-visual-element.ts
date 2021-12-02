import { visualElement } from "../"
import { createBox } from "../../projection/geometry/models"
import { CreateVisualElement, ScrapeMotionValuesFromProps } from "../types"
import { checkTargetForNewValues } from "../utils/setters"
import { setThreeValue } from "./utils/set-value"
import { readThreeValue } from "./utils/read-value"
import { ThreeRenderState } from "./types"
import { Object3DNode } from "@react-three/fiber"

export const scrapeMotionValuesFromProps: ScrapeMotionValuesFromProps =
    () => ({})

export const createRenderState = () => ({})

export const threeVisualElement = visualElement<
    Object3DNode<any, any>,
    ThreeRenderState,
    {}
>({
    treeType: "three",

    readValueFromInstance: readThreeValue,

    getBaseTarget(_props, _key) {
        return 0
    },

    sortNodePosition(_a, _b) {
        return 0
    },

    makeTargetAnimatable(element, target) {
        checkTargetForNewValues(element, target, {})
        return target
    },

    restoreTransform() {},

    resetTransform() {},

    removeValueFromRenderState(_key, _renderState) {},

    measureViewportBox: createBox,

    scrapeMotionValuesFromProps,

    build(_element, state, latestValues) {
        for (const key in latestValues) {
            state[key] = latestValues[key]
        }
    },

    render(instance, renderState) {
        for (const key in renderState) {
            setThreeValue(instance, key, renderState)
        }
    },
})

export const createVisualElement: CreateVisualElement<any> = (_, options) =>
    threeVisualElement(options)
