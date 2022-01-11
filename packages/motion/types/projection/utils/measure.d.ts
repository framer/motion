import { TransformPoint } from "../geometry/types";
import { IProjectionNode } from "../node/types";
export declare function measureViewportBox(instance: HTMLElement, transformPoint?: TransformPoint): import("../geometry/types").Box;
export declare function measurePageBox(element: HTMLElement, rootProjectionNode: IProjectionNode, transformPagePoint?: TransformPoint): import("../geometry/types").Box;
