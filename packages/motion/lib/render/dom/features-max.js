import { __assign } from "tslib";
import { drag } from "../../motion/features/drag";
import { layoutFeatures } from "../../motion/features/layout";
import { HTMLProjectionNode } from "../../projection";
import { domAnimation } from "./features-animation";
/**
 * @public
 */
export var domMax = __assign(__assign(__assign(__assign({}, domAnimation), drag), layoutFeatures), { projectionNodeConstructor: HTMLProjectionNode });
//# sourceMappingURL=features-max.js.map