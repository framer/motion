import { __rest, __assign } from 'tslib';
import * as React from 'react';
import { useContext, useMemo } from 'react';
import { MotionConfigContext } from '../../context/MotionConfigContext.mjs';
import { useConstant } from '../../utils/use-constant.mjs';

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
function MotionConfig(_a) {
    var children = _a.children, config = __rest(_a, ["children"]);
    /**
     * Inherit props from any parent MotionConfig components
     */
    config = __assign(__assign({}, useContext(MotionConfigContext)), config);
    /**
     * Don't allow isStatic to change between renders as it affects how many hooks
     * motion components fire.
     */
    config.isStatic = useConstant(function () { return config.isStatic; });
    /**
     * Creating a new config context object will re-render every `motion` component
     * every time it renders. So we only want to create a new one sparingly.
     */
    var transitionDependency = typeof config.transition === "object"
        ? config.transition.toString()
        : "";
    var context = useMemo(function () { return config; }, [
        transitionDependency,
        config.transformPagePoint,
    ]);
    return (React.createElement(MotionConfigContext.Provider, { value: context }, children));
}

export { MotionConfig };
