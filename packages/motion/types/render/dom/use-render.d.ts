import { RenderComponent } from "../../motion/features/types";
import { HTMLRenderState } from "../html/types";
import { SVGRenderState } from "../svg/types";
export declare function createUseRender(forwardMotionProps?: boolean): RenderComponent<SVGElement | HTMLElement, HTMLRenderState | SVGRenderState>;
