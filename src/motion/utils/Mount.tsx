import { MotionValuesMap } from "./use-motion-values"
import { syncRenderSession } from "../../dom/sync-render-session"
import { RefObject, useEffect, memo } from "react"
import { invariant } from "hey-listen"
import styler from "stylefire"

interface MountProps {
    innerRef: RefObject<Element>
    values: MotionValuesMap
    isStatic: boolean
}

/**
 * `useEffect` gets resolved bottom-up. We defer some optional functionality to child
 * components, so to ensure everything runs correctly we export the ref-binding logic
 * to a new component rather than in `useMotionValues`.
 */
const MountComponent = ({ innerRef: ref, values, isStatic }: MountProps) => {
    useEffect(() => {
        invariant(
            ref.current instanceof Element,
            "No `ref` found. Ensure components created with `motion.custom` forward refs using `React.forwardRef`"
        )

        const domStyler = styler(ref.current as Element, {
            preparseOutput: false,
            enableHardwareAcceleration: !isStatic,
        })

        values.mount((key, value) => {
            domStyler.set(key, value)

            if (syncRenderSession.isOpen()) {
                syncRenderSession.push(domStyler)
            }
        })

        return () => values.unmount()
    }, [])

    return null
}

export const Mount = memo(MountComponent)
