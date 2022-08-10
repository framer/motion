import type { MotionValue } from ".."

export interface WillChange extends MotionValue {
    add(name: string): void
    remove(name: string): void
    get(): void
}
