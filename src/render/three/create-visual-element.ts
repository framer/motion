import { visualElement } from "../"
import { createBox } from "../../projection/geometry/models"
import { CreateVisualElement, ScrapeMotionValuesFromProps } from "../types"
import { checkTargetForNewValues, getOrigin } from "../utils/setters"
import { setThreeValue } from "./set-value"
import { ThreeRenderState } from "./types"

export const scrapeMotionValuesFromProps: ScrapeMotionValuesFromProps =
    () => ({})

export const createRenderState = () => ({})

export const threeVisualElement = visualElement<any, ThreeRenderState, {}>({
    treeType: "three",

    readValueFromInstance(instance, key) {
        console.log("reading value from instance", instance, key)

        return 0
    },

    sortNodePosition(a, b) {
        return 1
    },

    getBaseTarget(props, key) {
        console.log("getting base target", props, key)
        return 0
    },

    makeTargetAnimatable(element, target) {
        checkTargetForNewValues(element, target, {})
        return target
    },

    restoreTransform() {},

    resetTransform() {},

    removeValueFromRenderState(key, renderState) {},

    measureViewportBox: createBox,

    scrapeMotionValuesFromProps,

    build(element, state, latestValues, options, props) {
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
