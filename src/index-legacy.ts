import { createMotionComponent, MotionComponentConfig } from "./motion"
import { allMotionFeatures } from "./render/dom"
import { render } from "./render/dom/render"
import { HTMLMotionComponents, SVGMotionComponents } from "./render/dom/types"
import { useDomVisualElement } from "./render/dom/use-dom-visual-element"
import { parseDomVariant } from "./render/dom/utils/parse-dom-variant"
import {
    htmlElements,
    svgElements,
} from "./render/dom/utils/supported-elements"

/**
 * This is a legacy entry-point for enterprise customers who still need to support IE11.
 * It uses lists to generate `motion` components rather than `Proxy` which increases bundle size.
 * All modern Motion features can be polyfilled except `Proxy`.
 *
 * Usage:
 *
 * ```
 * import { legacyMotion as motion } from "framer-motion/tsc/index-legacy"
 * ```
 */

const config: MotionComponentConfig<HTMLElement | SVGElement> = {
    defaultFeatures: allMotionFeatures,
    useVisualElement: useDomVisualElement as any,
    render: render as any,
    animationControlsConfig: {
        makeTargetAnimatable: parseDomVariant,
    },
}

function createComponents<C>(
    componentKeys: typeof htmlElements | typeof svgElements
): C {
    const components: Partial<C> = {}
    for (const key in componentKeys) {
        components[key] = createMotionComponent(key, config)
    }

    return components as C
}

export const legacyMotion = {
    ...createComponents<HTMLMotionComponents>(htmlElements),
    ...createComponents<SVGMotionComponents>(svgElements),
    custom: (Component: string | any) =>
        createMotionComponent(Component, config),
}
