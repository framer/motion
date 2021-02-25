import { visualElement } from ".."
import { VisualElementConfig } from "../types"
import * as Three from "three"
import { axisBox } from "../../utils/geometry"
import { checkTargetForNewValues, getOrigin } from "../utils/setters"

export interface ThreeRenderState {}

export interface ThreeVisualElementOptions {}

const config: VisualElementConfig<
    Three.Object3D,
    ThreeRenderState,
    ThreeVisualElementOptions
> = {
    treeType: "three",

    /**
     *
     */
    readValueFromInstance(threeObject, key) {
        return 0
    },

    // TODO
    createRenderState: () => ({}),

    sortNodePosition() {
        /**
         * TODO: This determines stagger order based on the node position
         * in the tree. The DOM has a method for this, Element.compareDocumentPosition
         * I wonder if Three has similar.
         */
        return 0
    },

    // TODO
    getBaseTarget(props, key) {
        return 0
    },

    makeTargetAnimatable(
        element,
        { transition, transitionEnd, ...target },
        { transformValues },
        isMounted = true
    ) {
        isMounted &&
            checkTargetForNewValues(
                element,
                target,
                (getOrigin(target as any, transition || {}, element) as any) ||
                    {}
            )

        return { transition, transitionEnd, ...target }
    },

    /**
     * TODO. Look through the props and return a map of motion values
     * or values that should be
     */
    scrapeMotionValuesFromProps(props) {
        return {}
    },

    /**
     * TODO:
     * Delete references of this key from the render state
     */
    removeValueFromMutableState(key, renderState) {},

    /**
     * Layout projection methods - currently unused
     */
    measureViewportBox() {
        return axisBox()
    },
    resetTransform() {},
    restoreTransform() {},

    /**
     * TODO:
     * Take the latest motion values and build them into the render state
     */
    build(
        element,
        renderState,
        latestValues,
        _projection,
        _layoutState,
        options,
        props
    ) {},

    /**
     * TODO:
     * Take the latest values as built into renderState and apply them directly
     * to the threeObject
     */
    render(threeObject, renderState) {},
}

export const threeVisualElement = visualElement(config)
