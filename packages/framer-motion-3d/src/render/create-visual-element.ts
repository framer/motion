import type {
    CreateVisualElement,
    ResolvedValues,
    MotionProps,
} from "framer-motion"

import { createBox, VisualElement } from "framer-motion"
import { Object3D } from "three"

import { setThreeValue } from "./utils/set-value"
import { readThreeValue } from "./utils/read-value"
import { ThreeRenderState } from "../types"
import { scrapeMotionValuesFromProps } from "./utils/scrape-motion-value"

export const createRenderState = () => ({})

export class ThreeVisualElement extends VisualElement<
    Object3D,
    ThreeRenderState,
    {}
> {
    type = "three"

    readValueFromInstance(instance: Object3D, key: string) {
        return readThreeValue(instance, key)
    }

    getBaseTargetFromProps() {
        return undefined
    }

    sortInstanceNodePosition(a: Object3D, b: Object3D) {
        return a.id - b.id
    }

    removeValueFromRenderState() {}

    measureInstanceViewportBox() {
        return createBox()
    }

    scrapeMotionValuesFromProps(props: MotionProps, prevProps: MotionProps) {
        return scrapeMotionValuesFromProps(props, prevProps)
    }

    build(state: ThreeRenderState, latestValues: ResolvedValues) {
        for (const key in latestValues) {
            state[key as keyof ThreeRenderState] = latestValues[key] as any
        }
    }

    renderInstance(instance: Object3D, renderState: ThreeRenderState) {
        for (const key in renderState) {
            setThreeValue(instance, key, renderState)
        }
    }
}

export const createVisualElement: CreateVisualElement<any> = (_, options) =>
    new ThreeVisualElement(options, {})
