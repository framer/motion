import { RefObject } from "react"
import { PanInfo } from "../gestures"
import { MotionValue } from "../value"
import { Omit, Inertia } from "../types"
import { AnimationControls } from "../animation/AnimationControls"
import { GroupDragControls } from "./use-drag-controls"

/** @public */
export interface DragHandlers {
    /**
     * Callback function that fires when dragging starts.
     *
     * @library
     *
     * ```jsx
     * function onDragStart(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <Frame drag onDragStart={onDragStart} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div
     *   drag
     *   onDragStart={
     *     (event, info) => console.log(info.point.x, info.point.y)
     *   }
     * />
     * ```
     */
    onDragStart?(
        event: MouseEvent | TouchEvent | PointerEvent,
        info: PanInfo
    ): void

    /**
     * Callback function that fires when dragging ends.
     *
     * @library
     *
     * ```jsx
     * function onDragEnd(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <Frame drag onDragEnd={onDragEnd} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div
     *   drag
     *   onDragEnd={
     *     (event, info) => console.log(info.point.x, info.point.y)
     *   }
     * />
     * ```
     */
    onDragEnd?(
        event: MouseEvent | TouchEvent | PointerEvent,
        info: PanInfo
    ): void

    /**
     * Callback function that fires when the component is dragged.
     *
     * @library
     *
     * ```jsx
     * function onDrag(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <Frame drag onDrag={onDrag} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div
     *   drag
     *   onDrag={
     *     (event, info) => console.log(info.point.x, info.point.y)
     *   }
     * />
     * ```
     */
    onDrag?(event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo): void

    /**
     * Callback function that fires a drag direction is determined.
     *
     * @library
     *
     * ```jsx
     * function onDirectionLock(axis) {
     *   console.log(axis)
     * }
     *
     * <Frame
     *   drag
     *   dragDirectionLock
     *   onDirectionLock={onDirectionLock}
     * />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div
     *   drag
     *   dragDirectionLock
     *   onDirectionLock={axis => console.log(axis)}
     * />
     * ```
     */
    onDirectionLock?(axis: "x" | "y"): void

    /**
     * Callback function that fires when drag momentum/bounce transition finishes.
     *
     * @library
     *
     * ```jsx
     * function onDragTransitionEnd() {
     *   console.log('drag transition has ended')
     * }
     *
     * <Frame
     *   drag
     *   onDragTransitionEnd={onDragTransitionEnd}
     * />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div
     *   drag
     *   onDragTransitionEnd={() => console.log('Drag transition complete')}
     * />
     * ```
     */
    onDragTransitionEnd?(): void
}

/**
 * @public
 */
export type InertiaOptions = Partial<Omit<Inertia, "velocity" | "type">>

/**
 * @public
 */
export interface DraggableProps extends DragHandlers {
    /**
     * Enable dragging for this element. Set to `false` by default.
     * Set `true` to drag in both directions.
     * Set `"x"` or `"y"` to only drag in a specific direction.
     *
     * @library
     *
     * ```jsx
     * <Frame drag="x" />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div drag="x" />
     * ```
     */
    drag?: boolean | "x" | "y"

    /**
     * If `true`, this will lock dragging to the initially-detected direction. Defaults to `false`.
     *
     * @library
     *
     * ```jsx
     * <Frame drag={true} dragDirectionLock={true} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div drag dragDirectionLock />
     * ```
     */
    dragDirectionLock?: boolean

    /**
     * Allows drag gesture propagation to child components. Set to `false` by
     * default.
     *
     * @library
     *
     * ```jsx
     * <Frame drag="x" dragPropagation={true} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div drag="x" dragPropagation />
     * ```
     */
    dragPropagation?: boolean

    /**
     * An object of optional `top`, `left`, `right`, `bottom` pixel values,
     * beyond which dragging is constrained.
     *
     * Another component can be used as drag constraints by creating a `ref` with React's `useRef`.hook.
     * This `ref` should be passed to that component's `ref` prop and to this component's `dragConstraints` prop.
     *
     * @library
     *
     * ```jsx
     * // In pixels
     * <Frame
     *   drag="x"
     *   dragConstraints={{ left: 0, right: 300 }}
     * />
     *
     * // As a ref to another component
     * function MyComponent() {
     *   const constraintsRef = useRef(null)
     *
     *   return (
     *      <Frame ref={constraintsRef} width={400} height={400}>
     *          <Frame drag dragConstraints={constraintsRef} />
     *      </Frame>
     *   )
     * }
     * ```
     *
     * @motion
     *
     * ```jsx
     * // In pixels
     * <motion.div
     *   drag="x"
     *   dragConstraints={{ left: 0, right: 300 }}
     * />
     *
     * // As a ref to another component
     * const MyComponent = () => {
     *   const constraintsRef = useRef(null)
     *
     *   return (
     *      <motion.div ref={constraintsRef}>
     *          <motion.div drag dragConstraints={constraintsRef} />
     *      </motion.div>
     *   )
     * }
     * ```
     */
    dragConstraints?:
        | false
        | { top?: number; right?: number; bottom?: number; left?: number }
        | RefObject<Element>

    /**
     * The degree of movement allowed outside constraints. 0 = no movement, 1 =
     * full movement. Set to `0.5` by default.
     *
     * @library
     *
     * ```jsx
     * <Frame
     *   drag={true}
     *   dragConstraints={{ left: 0, right: 300 }}
     *   dragElastic={0.2}
     * />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div
     *   drag
     *   dragConstraints={{ left: 0, right: 300 }}
     *   dragElastic={0.2}
     * />
     * ```
     */
    dragElastic?: boolean | number

    /**
     * Apply momentum from the pan gesture to the component when dragging
     * finishes. Set to `true` by default.
     *
     * @library
     *
     * ```jsx
     * <Frame
     *   drag={true}
     *   dragConstraints={{ left: 0, right: 300 }}
     *   dragMomentum={false}
     * />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div
     *   drag
     *   dragConstraints={{ left: 0, right: 300 }}
     *   dragMomentum={false}
     * />
     * ```
     */
    dragMomentum?: boolean

    /**
     * Allows you to change dragging inertia parameters.
     * When releasing a draggable Frame, an animation with type `inertia` starts. The animation is based on your dragging velocity. This property allows you to customize it.
     * See {@link https://framer.com/api/animation/#inertia | Inertia} for all properties you can use.
     *
     * @library
     *
     * ```jsx
     * <Frame
     *   drag={true}
     *   dragTransition={{ bounceStiffness: 600, bounceDamping: 10 }}
     * />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div
     *   drag
     *   dragTransition={{ bounceStiffness: 600, bounceDamping: 10 }}
     * />
     * ```
     */
    dragTransition?: InertiaOptions

    /**
     * @internalremarks
     *
     * _dragValueX, _dragValueY and _dragTransitionControls are a way of allowing this
     * component to be a drag target for another element.
     *
     * @internal
     */
    _dragValueX?: MotionValue<number>
    /**
     * @internal
     */
    _dragValueY?: MotionValue<number>
    /**
     * @internal
     */
    _dragTransitionControls?: AnimationControls

    /**
     * Drag position is calculated by applying the pan offset to the x/y origin
     * measured when the drag gesture begins.
     *
     * By manually creating `dragOriginX` as a `MotionValue`, it can be updated
     * while the gesture is active, for instance to visually offset any movement should
     * the component change layout.
     *
     * @library
     *
     * ```jsx
     * const dragOriginX = useMotionValue(0)
     *
     * return <Frame dragOriginX={dragOriginX} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * const dragOriginX = useMotionValue(0)
     *
     * return <motion.div dragOriginX={dragOriginX} />
     * ```
     *
     * @public
     */
    dragOriginX?: MotionValue<number>

    /**
     * Drag position is calculated by applying the pan offset to the x/y origin
     * measured when the drag gesture begins.
     *
     * By manually creating `dragOriginY` as a `MotionValue`, it can be updated
     * while the gesture is active, for instance to visually offset any movement should
     * the component change layout.
     *
     * @library
     *
     * ```jsx
     * const dragOriginY = useMotionValue(0)
     *
     * return <Frame dragOriginY={dragOriginY} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * const dragOriginY = useMotionValue(0)
     *
     * return <motion.div dragOriginY={dragOriginY} />
     * ```
     *
     * @public
     */
    dragOriginY?: MotionValue<number>

    /**
     * Usually, dragging is initiated by pressing down on a component and moving it. For some
     * use-cases, for instance clicking at an arbitrary point on a video scrubber, we
     * might want to initiate dragging from a different component than the draggable one.
     *
     * By creating a `dragControls` using the `useDragControls` hook, we can pass this into
     * the draggable component's `dragControls` prop. It exposes a `start` method
     * that can start dragging from pointer events on other components.
     *
     * @library
     *
     * ```jsx
     * const dragControls = useDragControls()
     *
     * return (
     *   <>
     *     <Frame onTapStart={(event) => dragControls.start(event, { snapToCursor: true })} />
     *     <Frame drag="x" dragControls={dragControls} />
     *   </>
     * )
     * ```
     *
     * @motion
     *
     * ```jsx
     * const dragControls = useDragControls()
     *
     * return (
     *   <>
     *     <div onMouseDown={(event) => dragControls.start(event, { snapToCursor: true })} />
     *     <motion.div drag="x" dragControls={dragControls} />
     *   </>
     * )
     * ```
     */
    dragControls?: GroupDragControls
}
