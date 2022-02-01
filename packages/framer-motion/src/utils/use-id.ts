import * as React from "react"
import { useConstant } from "./use-constant"

let counter = 0
const incrementId = () => counter++
export const useId = (React as any).useId
    ? (React as any).useId
    : () => useConstant(incrementId)
