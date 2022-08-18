import { MotionOptions } from "./types"

export class MotionState {
    options: MotionOptions

    element: HTMLElement

    parent?: MotionState

    depth: number

    active = {
        initial: true,
        animate: true,
    }

    constructor(options: MotionOptions, parent?: MotionState) {
        this.options = options
        this.parent = parent
        this.depth = parent ? parent.depth + 1 : 0
        console.log(this.depth)
    }

    mount(element: HTMLElement) {
        this.element = element
    }

    update(options: MotionOptions) {
        this.options = options
    }
}
