import { RefObject } from "react"
import { PanInfo } from "../PanSession"
import { Inertia, TargetAndTransition } from "../../types"
import { BoundingBox2D } from "../../types/geometry"
import { DragControls } from "./use-drag-controls"
import { MotionValue } from "../../value"
import { VariantLabels } from "../../motion/types"

export type DragHandler = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
) => void

/**
 * @public
 */
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
     *
     * @public
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
     *
     * @public
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
     *
     * @public
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
     *
     * @public
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
     *
     * @public
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
     * Properties or variant label to animate to while the drag gesture is recognised.
     *
     * ```jsx
     * <motion.div whileDrag={{ scale: 1.2 }} />
     * ```
     */
    whileDrag?: VariantLabels | TargetAndTransition

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
     * Applies constraints on the permitted draggable area.
     *
     * It can accept an object of optional `top`, `left`, `right`, and `bottom` values, measured in pixels.
     * This will define a distance the named edge of the draggable component.
     *
     * Alternatively, it can accept a `ref` to another component created with React's `useRef` hook.
     * This `ref` should be passed both to the draggable component's `dragConstraints` prop, and the `ref`
     * of the component you want to use as constraints.
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
    dragConstraints?: false | Partial<BoundingBox2D> | RefObject<Element>

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
     * function startDrag(event) {
     *   dragControls.start(event, { snapToCursor: true })
     * }
     *
     * return (
     *   <>
     *     <Frame onTapStart={startDrag} />
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
     * function startDrag(event) {
     *   dragControls.start(event, { snapToCursor: true })
     * }
     *
     * return (
     *   <>
     *     <div onPointerDown={startDrag} />
     *     <motion.div drag="x" dragControls={dragControls} />
     *   </>
     * )
     * ```
     */
    dragControls?: DragControls

    /**
     * By default, if `drag` is defined on a component then an event listener will be attached
     * to automatically initiate dragging when a user presses down on it.
     *
     * By setting `dragListener` to `false`, this event listener will not be created.
     *
     * @library
     *
     * ```jsx
     * const dragControls = useDragControls()
     *
     * function startDrag(event) {
     *   dragControls.start(event, { snapToCursor: true })
     * }
     *
     * return (
     *   <>
     *     <Frame onTapStart={startDrag} />
     *     <Frame
     *       drag="x"
     *       dragControls={dragControls}
     *       dragListener={false}
     *     />
     *   </>
     * )
     * ```
     *
     * @motion
     *
     * ```jsx
     * const dragControls = useDragControls()
     *
     * function startDrag(event) {
     *   dragControls.start(event, { snapToCursor: true })
     * }
     *
     * return (
     *   <>
     *     <div onPointerDown={startDrag} />
     *     <motion.div
     *       drag="x"
     *       dragControls={dragControls}
     *       dragListener={false}
     *     />
     *   </>
     * )
     * ```
     */
    dragListener?: boolean

    /**
     * If `dragConstraints` is set to a React ref, this callback will call with the measured drag constraints.
     *
     * @public
     */
    onMeasureDragConstraints?: (
        constraints: BoundingBox2D
    ) => BoundingBox2D | void

    /**
     * Usually, dragging uses the layout project engine, and applies transforms to the underlying VisualElement.
     * Passing MotionValues as _dragX and _dragY instead applies drag updates to these motion values.
     * This allows you to manually control how updates from a drag gesture on an element is applied.
     *
     * @public
     */
    _dragX?: MotionValue<number>

    /**
     * Usually, dragging uses the layout project engine, and applies transforms to the underlying VisualElement.
     * Passing MotionValues as _dragX and _dragY instead applies drag updates to these motion values.
     * This allows you to manually control how updates from a drag gesture on an element is applied.
     *
     * @public
     */
    _dragY?: MotionValue<number>
}
