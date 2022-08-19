import { AnimationControls } from "../types"

export function isAnimationControls(v?: unknown): v is AnimationControls {
    return !!(v && typeof (v as any).start === "function")
}
