import { AnimateOptions } from "../types"

// TODO: Type this so it can return value-specific overrides
export const getValueOptions = (
    options: AnimateOptions,
    key: string
): AnimateOptions =>
    /**
     * TODO: Make test for this
     * Always return a new object otherwise delay is overwritten by results of stagger
     * and this results in no stagger
     */
    options[key] ? { ...options, ...options[key] } : { ...options }
