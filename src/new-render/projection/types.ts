import { MotionValue } from "../../value"

export interface Projection {
    hasValue(key: string): boolean

    addValue(key: string, value: MotionValue<any>): void

    removeValue(key: string): void

    getValue(key: string): undefined | MotionValue
    getValue(key: string, defaultValue: string | number): MotionValue
    getValue(
        key: string,
        defaultValue?: string | number
    ): undefined | MotionValue
}
