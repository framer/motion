import * as React from "react"
import { useContext, forwardRef, MutableRefObject } from "react"
import { MotionContext } from "../../context/MotionContext"
import mergeRefs from "react-merge-refs"
import useMeasure from "react-use-measure"
import {
    render,
    unmountComponentAtNode,
    events as createPointerEvents,
    Props,
} from "@react-three/fiber"
import { useIsomorphicLayoutEffect } from "../../utils/use-isomorphic-effect"
import { MotionConfigContext } from "../../context/MotionConfigContext"

export interface MotionCanvasProps extends Props {}

type SetBlock = false | Promise<null> | null
type UnblockProps = {
    set: React.Dispatch<React.SetStateAction<SetBlock>>
    children: React.ReactNode
}

function Block({ set }: Omit<UnblockProps, "children">) {
    useIsomorphicLayoutEffect(() => {
        set(new Promise(() => null))
        return () => set(false)
    }, [])
    return null
}

class ErrorBoundary extends React.Component<
    { set: React.Dispatch<any> },
    { error: boolean }
> {
    state = { error: false }
    static getDerivedStateFromError = () => ({ error: true })
    componentDidCatch(error: any) {
        this.props.set(error)
    }
    render() {
        return this.state.error ? null : this.props.children
    }
}

/**
 * A synchronously rendering version of R3F's Canvas component. We call render
 * within the render function itself to ensure lifecycle events are called before
 * parent reconcilers. This can be replaced with a simple MotionContext provider
 * when R3F moves to the same model.
 */
function SyncCanvasComponent(
    {
        children,
        fallback,
        tabIndex,
        resize,
        id,
        style,
        className,
        events,
        ...props
    }: MotionCanvasProps,
    forwardedRef: MutableRefObject<HTMLCanvasElement>
) {
    const motionContext = useContext(MotionContext)
    const configContext = useContext(MotionConfigContext)

    const [containerRef, { width, height }] = useMeasure({
        scroll: true,
        debounce: { scroll: 50, resize: 0 },
        ...resize,
    })
    const canvasRef = React.useRef<HTMLCanvasElement>(null!)
    const [block, setBlock] = React.useState<SetBlock>(false)
    const [error, setError] = React.useState<any>(false)
    // Suspend this component if block is a promise (2nd run)
    if (block) throw block
    // Throw exception outwards if anything within canvas throws
    if (error) throw error

    // Execute JSX in the reconciler as a layout-effect
    if (width > 0 && height > 0) {
        render(
            <ErrorBoundary set={setError}>
                <React.Suspense fallback={<Block set={setBlock} />}>
                    <MotionConfigContext.Provider value={configContext}>
                        <MotionContext.Provider value={motionContext}>
                            {children}
                        </MotionContext.Provider>
                    </MotionConfigContext.Provider>
                </React.Suspense>
            </ErrorBoundary>,
            canvasRef.current,
            {
                ...props,
                size: { width, height },
                events: events || createPointerEvents,
            }
        )
    }

    useIsomorphicLayoutEffect(() => {
        const container = canvasRef.current
        return () => unmountComponentAtNode(container)
    }, [])

    return (
        <div
            ref={containerRef}
            id={id}
            className={className}
            tabIndex={tabIndex}
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "hidden",
                ...style,
            }}
        >
            <canvas
                ref={mergeRefs([canvasRef, forwardedRef])}
                style={{ display: "block" }}
            >
                {fallback}
            </canvas>
        </div>
    )
}

export const MotionCanvas = forwardRef(SyncCanvasComponent)

// function useLayoutResize() {
//     const forceResize = useRef<VoidFunction>(null)

//     useEffect(() => {
//         forceResize.current?.()
//     }, [])

//     const Resize = useMemo(() => {
//         // TODO Replace with proxied resize observer if possible
//         return class FakeResizeObserver {
//             constructor(callback: VoidFunction) {
//                 forceResize.current = callback
//             }
//             observe() {}
//             disconnect() {}
//         }
//     }, [])

//     return [forceResize, Resize]
// }

// function LayoutAwareCamera({
//     state,
//     forceResize,
//     measuredLayout,
//     makeDefault,
//     ...props
// }) {
//     const three = useThree()
//     const layout = useRef<Box>({})
//     const parentVisualElement = useVisualElementContext()
//     const set = useThree(({ set }) => set)
//     const camera = useThree(({ camera }) => camera)
//     const size = useThree(({ size }) => size)
//     const cameraRef = React.useRef<THREE.PerspectiveCamera>()

//     const updateCamera = () => {
//         const { x, y } = layout.current

//         if (camera) {
//             camera.aspect =
//                 x && y
//                     ? (x.max - x.min) / (y.max - y.min)
//                     : size.width / size.height
//             camera.updateProjectionMatrix()
//             camera.updateMatrixWorld()
//         }
//     }

//     useLayoutEffect(updateCamera)
//     useFrame(updateCamera)

//     useLayoutEffect(() => {
//         if (!parentVisualElement || !parentVisualElement.projection) return

//         const removeUpdateListener =
//             parentVisualElement.projection.addEventListener(
//                 "projectionUpdate",
//                 ((latest: Box) => {
//                     layout.current = latest
//                 }) as any
//             )

//         const removeMeasureListener =
//             parentVisualElement.projection.addEventListener("measure", (({
//                 x,
//                 y,
//             }: Box) => {
//                 // TODO At high layout deltas we could render at a higher DPI to reduce pixelation
//                 measuredLayout.current.width = x.max - x.min
//                 measuredLayout.current.height = y.max - y.min
//                 three.gl.setSize((x.max - x.min) * 2, (y.max - y.min) * 2)
//                 forceResize.current()
//             }) as any)

//         return () => {
//             removeUpdateListener()
//             removeMeasureListener()
//         }
//     }, [])

//     React.useLayoutEffect(() => {
//         if (makeDefault && cameraRef.current) {
//             const oldCam = camera
//             set(() => ({ camera: cameraRef.current! }))
//             return () => set(() => ({ camera: oldCam }))
//         }
//     }, [camera, cameraRef, makeDefault, set])

//     return (
//         <motion.perspectiveCamera
//             ref={mergeRefs([cameraRef])}
//             {...props}
//             fov={45}
//             position-z={5}
//             initial={false}
//             animate={
//                 state
//                     ? { x: 0, y: 0, z: 6, rotateX: 0, rotateY: 0, rotateZ: 0 }
//                     : { x: 5, y: 0, z: 0, rotateY: 1.5708 }
//             }
//         />
//     )
// }
