import { ResolvedValueTarget } from "../../types";
/**
 * Check if a value is animatable. Examples:
 *
 * ✅: 100, "100px", "#fff"
 * ❌: "block", "url(2.jpg)"
 * @param value
 *
 * @internal
 */
export declare const isAnimatable: (key: string, value: ResolvedValueTarget) => boolean;
