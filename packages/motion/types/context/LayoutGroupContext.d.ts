/// <reference types="react" />
import { NodeGroup } from "../projection/node/group";
export interface LayoutGroupContextProps {
    id?: string;
    group?: NodeGroup;
    forceRender?: VoidFunction;
}
/**
 * @internal
 */
export declare const LayoutGroupContext: import("react").Context<LayoutGroupContextProps>;
