/// <reference types="react" />
import { VariantLabels } from "../motion/types";
/**
 * @public
 */
export interface PresenceContextProps {
    id: number;
    isPresent: boolean;
    register: (id: number) => () => void;
    onExitComplete?: (id: number) => void;
    initial?: false | VariantLabels;
    custom?: any;
}
/**
 * @public
 */
export declare const PresenceContext: import("react").Context<PresenceContextProps | null>;
