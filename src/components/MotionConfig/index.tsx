import * as React from "react"
import { useContext, useMemo } from "react"
import { MotionConfigContext } from "../../context/MotionConfigContext"
import { useConstant } from "../../utils/use-constant"

export interface MotionConfigProps extends Partial<MotionConfigContext> {
    children?: React.ReactNode
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
export function MotionConfig({ children, ...config }: MotionConfigProps) {
    /**
     * Inherit props from any parent MotionConfig components
     */
    config = { ...useContext(MotionConfigContext), ...config }

    /**
     * Don't allow isStatic to change between renders as it affects how many hooks
     * motion components fire.
     */
    config.isStatic = useConstant(() => config.isStatic)

    /**
     * Creating a new config context object will re-render every `motion` component
     * every time it renders. So we only want to create a new one sparingly.
     */
    const transitionDependency =
        typeof config.transition === "object"
            ? config.transition.toString()
            : ""

    const context = useMemo(() => config, [
        transitionDependency,
        config.transformPagePoint,
    ])

    return (
        <MotionConfigContext.Provider value={context as MotionConfigContext}>
            {children}
        </MotionConfigContext.Provider>
    )
}
