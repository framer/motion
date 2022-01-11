import * as React from "react";
import { MotionConfigContext } from "../../context/MotionConfigContext";
export interface MotionConfigProps extends Partial<MotionConfigContext> {
    children?: React.ReactNode;
}
/**
 * `MotionConfig` is used to set configuration options for all children `motion` components.
 *
 * ```jsx
 * import { motion, MotionConfig } from "framer-motion"
 *
 * export function App() {
 *   return (
 *     <MotionConfig transition={{ type: "spring" }}>
 *       <motion.div animate={{ x: 100 }} />
 *     </MotionConfig>
 *   )
 * }
 * ```
 *
 * @public
 */
export declare function MotionConfig({ children, ...config }: MotionConfigProps): JSX.Element;
