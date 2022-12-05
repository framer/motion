import { MotionComponentConfig } from "../../motion"
import { SVGRenderState } from "./types"
import { renderSVG } from "./utils/render"
import { scrapeMotionValuesFromProps as scrapeSVGProps } from "./utils/scrape-motion-values"
import { makeUseVisualState } from "../../motion/utils/use-visual-state"
import { createSvgRenderState } from "./utils/create-render-state"
import { buildSVGAttrs } from "./utils/build-attrs"

export const svgMotionConfig: Partial<
    MotionComponentConfig<SVGElement, SVGRenderState>
> = {
    useVisualState: makeUseVisualState({
        scrapeMotionValuesFromProps: scrapeSVGProps,
        createRenderState: createSvgRenderState,
        onMount: (props, instance, { renderState, latestValues }) => {
            try {
                renderState.dimensions =
                    typeof (instance as SVGGraphicsElement).getBBox ===
                    "function"
                        ? (instance as SVGGraphicsElement).getBBox()
                        : (instance.getBoundingClientRect() as DOMRect)
            } catch (e) {
                // Most likely trying to measure an unrendered element under Firefox
                renderState.dimensions = {
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0,
                }
            }

            buildSVGAttrs(
                renderState,
                latestValues,
                { enableHardwareAcceleration: false },
                instance.tagName.toLowerCase() === "svg",
                props.transformTemplate
            )

            renderSVG(instance, renderState)
        },
    }),
}
