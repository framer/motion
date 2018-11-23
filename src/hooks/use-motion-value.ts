import { useMemo } from "react"
import { motionValue } from "../motion-value"

export const useMotionValue = (init: number | string) => useMemo(() => motionValue(init), [])
