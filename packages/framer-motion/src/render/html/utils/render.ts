import { MotionStyle } from "../../.."
import { IProjectionNode } from "../../../projection/node/types"
import { HTMLRenderState } from "../types"

export function renderHTML(
    element: HTMLElement,
    { style, vars }: HTMLRenderState,
    styleProp?: MotionStyle,
    projection?: IProjectionNode
) {
    const projectionStyles =
        projection && projection.getProjectionStyles(styleProp)
    Object.assign(element.style, style, projectionStyles)

    if (element.dataset.framerAppearId === "smxowt") {
        console.log(
            "seting opacity",
            style.opacity,
            // "computed opacity",
            // getComputedStyle(element).opacity,
            "num opacity waapi animations",
            element.getAnimations().filter((animation) => {
                // return animations that are running and have an opacity keyframe
                return (
                    animation.playState === "running" &&
                    (animation.effect as KeyframeEffect).getKeyframes()[0]
                        .opacity !== undefined
                )
            }).length
        )
    }

    // Loop over any CSS variables and assign those.
    for (const key in vars) {
        element.style.setProperty(key, vars[key] as string)
    }
}
