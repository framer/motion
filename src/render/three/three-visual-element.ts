import { visualElement } from ".."
import { VisualElementConfig } from "../types"
import * as Three from "three"
import { axisBox } from "../../utils/geometry"
import { checkTargetForNewValues, getOrigin } from "../utils/setters"
import { getChildIndex } from "./utils/get-child-index"

export interface ThreeRenderState {
    position?: [number, number, number]
    rotation?: [number, number, number]
    scale?: [number, number, number]
    color?: Three.Color
    opacity?: number
}

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

    sortNodePosition(a, b) {
        return getChildIndex(a) > getChildIndex(b) ? 1 : -1
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
        _element,
        renderState,
        {
            x,
            y,
            z,
            scaleX,
            scaleY,
            scaleZ,
            scale,
            rotateX,
            rotateY,
            rotateZ,
            color,
            opacity,
        },
        _projection,
        _layoutState,
        _options,
        props
    ) {
        makeVector3(renderState, "position", x, y, z, props)
        makeVector3(
            renderState,
            "scale",
            scaleX,
            scaleY,
            scaleZ,
            props,
            scale ?? 1
        )
        makeVector3(renderState, "rotation", rotateX, rotateY, rotateZ, props)

        if (color) {
            renderState.color = new Three.Color(color)
        }

        if (opacity !== undefined) renderState.opacity = opacity as number
    },

    /**
     * TODO:
     * Take the latest values as built into renderState and apply them directly
     * to the threeObject
     */
    render(threeObject, renderState) {
        renderState.position &&
            threeObject.position.set(...renderState.position)
        renderState.scale && threeObject.scale.set(...renderState.scale)
        renderState.rotation &&
            threeObject.rotation.set(...renderState.rotation)
        threeObject.material?.color = renderState.color
        threeObject.material?.opacity = renderState.opacity
    },
}

export const applyValue = {
    x: (element: any, value: any) => (element.position.x = value),
    y: (element: any, value: any) => (element.position.y = value),
    z: (element: any, value: any) => (element.position.z = value),
    position: (element: any, value: [number, number, number]) => {
        element.position.x = value[0]
        element.position.y = value[1]
        element.position.z = value[2]
    },
    scale: (element: any, value: any) => {
        element.scale.x = value
        element.scale.y = value
        element.scale.z = value
    },
    scaleX: (element: any, value: any) => (element.scale.x = value),
    scaleY: (element: any, value: any) => (element.scale.y = value),
    scaleZ: (element: any, value: any) => (element.scale.z = value),
    rotateX: (element: any, value: any) => (element.rotation.x = value),
    rotateY: (element: any, value: any) => (element.rotation.y = value),
    rotateZ: (element: any, value: any) => (element.rotation.z = value),
    rotate: (element: any, value: any) => (element.rotation.z = value),
    // drilling into the material from the mesh
    // motion.material doesn't seem to work since they're not components?
    color: (element: any, value: any) => element.material.color.set(value),
    opacity: (element: any, value: any) => (element.material.opacity = value),
}

function makeVector3(
    renderState: ThreeRenderState,
    name: string,
    a?: number,
    b?: number,
    c?: number,
    props?: any,
    defaultValue?: number
) {
    /**
     * If none of these values exist, delete the renderState (if it exists)
     */
    if (
        a === undefined &&
        b === undefined &&
        c === undefined &&
        defaultValue === undefined
    ) {
        delete renderState[name]
        return
    }

    if (!renderState[name]) {
        renderState[name] = [0, 0, 0]
    }

    const value = renderState[name]
    value[0] = a ?? props[name]?.[0] ?? defaultValue
    value[1] = a ?? props[name]?.[1] ?? defaultValue
    value[2] = a ?? props[name]?.[2] ?? defaultValue
}

export const threeVisualElement = visualElement(config)
