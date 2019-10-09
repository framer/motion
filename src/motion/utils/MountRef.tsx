import { MotionValuesMap } from "./use-motion-values"
import { syncRenderSession } from "../../dom/sync-render-session"
import { useExternalRef } from "./use-external-ref"
import { RefObject, Ref, useEffect, forwardRef, memo } from "react"
import { invariant } from "hey-listen"
import styler from "stylefire"

/**
 * `useEffect` gets resolved bottom-up. We defer some optional functionality to child
 * components, so to ensure everything runs correctly we export the ref-binding logic
 * to a new component rather than in `useMotionValues`.
 */
const MountRefComponent = (
    {
        values,
        isStatic,
        externalRef,
    }: {
        values: MotionValuesMap
        isStatic: boolean
        externalRef?: Ref<Element>
    },
    ref: RefObject<Element>
) => {
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

    useExternalRef(ref, externalRef)

    return null
}

export const MountRef = memo(forwardRef(MountRefComponent))
