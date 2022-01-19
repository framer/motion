import type { CreateVisualElement } from "framer-motion"

import {
    createBox,
    checkTargetForNewValues,
    visualElement,
} from "framer-motion"
import { Object3DNode } from "@react-three/fiber"

import { setThreeValue } from "./utils/set-value"
import { readThreeValue } from "./utils/read-value"
import { ThreeRenderState } from "../types"
import { scrapeMotionValuesFromProps } from "./utils/scrape-motion-value"

export const createRenderState = () => ({})

export const threeVisualElement = visualElement<
    Object3DNode<any, any>,
    ThreeRenderState,
    {}
>({
    treeType: "three",

    readValueFromInstance: readThreeValue,

    getBaseTarget() {
        return undefined
    },

    sortNodePosition(a, b) {
        return a.id - b.id
    },

    makeTargetAnimatable(element, { transition, ...target }) {
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
