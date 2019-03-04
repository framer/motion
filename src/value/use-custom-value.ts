import { useMemo, useRef } from "react"
import { MotionValue } from "./"

export function useCustomStyle(
    parent: MotionValue<any>,
    getTransformer: () => (v: any) => any,
    comparitor: any[]
) {
    const value = useRef<MotionValue | null>(null)

    return useMemo(() => {
        if (value.current) value.current.destroy()

        value.current = parent.addChild({ transformer: getTransformer() })

        return value.current
    }, comparitor)
}
