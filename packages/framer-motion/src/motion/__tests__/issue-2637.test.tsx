import * as React from "react"
import { motion } from "../.."
import { DragControls } from "../../gestures/drag/use-drag-controls"
import { render } from "../../jest.setup"

function createSpy() {
    const received: Record<string, unknown> = {}
    const Component = React.forwardRef<HTMLDivElement, any>((props, ref) => {
        Object.assign(received, props)
        return <div ref={ref} />
    })
    return { received, MotionComponent: motion.create(Component) as any }
}

/**
 * #2637: any prop starting with "drag" is treated as a motion prop and
 * swallowed, so custom props like "dragHandle" never reach a component
 * wrapped with motion.create().
 */
test("forwards custom drag-prefixed props to wrapped components", () => {
    const { received, MotionComponent } = createSpy()

    render(<MotionComponent dragHandle="handle" draggingLabel="label" />)

    expect(received.dragHandle).toBe("handle")
    expect(received.draggingLabel).toBe("label")
})

test("still doesn't forward Motion's own drag props", () => {
    const { received, MotionComponent } = createSpy()

    render(<MotionComponent drag="x" dragElastic={0.5} />)

    expect(received.drag).toBeUndefined()
    expect(received.dragElastic).toBeUndefined()
})

const motionDragProps = {
    drag: true,
    dragDirectionLock: true,
    dragPropagation: true,
    dragConstraints: { left: 0, right: 100 },
    dragElastic: 0.5,
    dragMomentum: false,
    dragTransition: { power: 0.2 },
    dragSnapToOrigin: true,
    dragListener: true,
    dragControls: new DragControls(),
}

test("doesn't forward any of Motion's own drag props to wrapped components", () => {
    const { received, MotionComponent } = createSpy()

    render(<MotionComponent {...motionDragProps} />)

    for (const key in motionDragProps) {
        expect(received[key]).toBeUndefined()
    }
})

test("doesn't render Motion's own drag props as DOM attributes", () => {
    const { container } = render(
        <motion.div data-testid="el" {...motionDragProps} />
    )
    const el = container.firstChild as Element

    for (const key in motionDragProps) {
        expect(el.hasAttribute(key)).toBe(false)
        expect(el.hasAttribute(key.toLowerCase())).toBe(false)
    }
})

test("still forwards the native draggable attribute", () => {
    const { container } = render(<motion.div draggable />)

    expect((container.firstChild as Element).getAttribute("draggable")).toBe(
        "true"
    )
})
