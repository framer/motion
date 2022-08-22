import { AnimationControls } from "../types"

export function isAnimationControls(v?: unknown): v is AnimationControls {
    return typeof v === "object" && typeof (v as any).start === "function"
}
