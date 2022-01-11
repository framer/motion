/// <reference types="react" />
import { IProjectionNode } from "../projection/node/types";
import { Transition } from "../types";
export interface SwitchLayoutGroup {
    register?: (member: IProjectionNode) => void;
    deregister?: (member: IProjectionNode) => void;
}
export declare type SwitchLayoutGroupContext = SwitchLayoutGroup & InitialPromotionConfig;
export declare type InitialPromotionConfig = {
    /**
     * The initial transition to use when the elements in this group mount (and automatically promoted).
     * Subsequent updates should provide a transition in the promote method.
     */
    transition?: Transition;
    /**
     * If the follow tree should preserve its opacity when the lead is promoted on mount
     */
    shouldPreserveFollowOpacity?: (member: IProjectionNode) => boolean;
};
/**
 * @internal
 */
export declare const SwitchLayoutGroupContext: import("react").Context<SwitchLayoutGroupContext>;
