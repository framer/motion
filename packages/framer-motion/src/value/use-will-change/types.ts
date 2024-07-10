import type { MotionValue } from ".."

export interface WillChange extends MotionValue {
    add(name: string): undefined | VoidFunction
}
