import { MakeTargetAnimatable } from "../../utils/animation";
/**
 * Parse a DOM variant to make it animatable. This involves resolving CSS variables
 * and ensuring animations like "20%" => "calc(50vw)" are performed in pixels.
 */
export declare const parseDomVariant: MakeTargetAnimatable;
