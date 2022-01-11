import { ResolvedValues } from "../../render/types";
import { Delta, Point } from "../geometry/types";
export declare const identityProjection = "translate3d(0px, 0px, 0) scale(1, 1)";
export declare function buildProjectionTransform(delta: Delta, treeScale: Point, latestTransform?: ResolvedValues): string;
