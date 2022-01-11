import { IProjectionNode } from "./types";
export interface NodeGroup {
    add: (node: IProjectionNode) => void;
    remove: (node: IProjectionNode) => void;
    dirty: VoidFunction;
}
export declare function nodeGroup(): NodeGroup;
