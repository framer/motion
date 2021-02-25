import * as Three from "three"

export function getChildIndex(child: Three.Object3D) {
    return child && child.parent ? child.parent.children.indexOf(child) : -1
}
