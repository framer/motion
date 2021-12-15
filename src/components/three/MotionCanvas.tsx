import * as React from "react"
import {
    useContext,
    useLayoutEffect,
    useRef,
    useState,
    forwardRef,
    MutableRefObject,
} from "react"
import { MotionContext } from "../../context/MotionContext"
import mergeRefs from "react-merge-refs"
import {
    render,
    unmountComponentAtNode,
    events as createPointerEvents,
    Props,
    Camera,
} from "@react-three/fiber"
import { useIsomorphicLayoutEffect } from "../../utils/use-isomorphic-effect"
import { MotionConfigContext } from "../../context/MotionConfigContext"
import { DimensionsState, MotionCanvasContext } from "./MotionCanvasContext"

export interface MotionCanvasProps extends Omit<Props, "resize"> {}

type SetBlock = false | Promise<null> | null
type UnblockProps = {
    set: React.Dispatch<React.SetStateAction<SetBlock>>
    children: React.ReactNode
}

/**
 * This file contains a version of R3F's Canvas component that uses our projection
 * system for layout measurements instead of use-react-measure so we can keep the
 * projection and cameras in sync.
 *
 * https://github.com/pmndrs/react-three-fiber/blob/master/packages/fiber/src/web/Canvas.tsx
 */

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

function CanvasComponent(
    {
        children,
        fallback,
        tabIndex,
        id,
        style,
        className,
        events,
        ...props
    }: MotionCanvasProps,
    forwardedRef: MutableRefObject<HTMLCanvasElement>
) {
    /**
     * Import existing contexts to pass through variants and MotionConfig from
     * the DOM to the 3D tree. Shared variants aren't officially supported yet
     * because the parent DOM tree fires effects before the 3D tree, whereas
     * variants are expected to run from bottom-up in useEffect.
     */
    const motionContext = useContext(MotionContext)
    const configContext = useContext(MotionConfigContext)

    const layoutCamera = useRef<Camera>(null)
    const [dimensions, setDimensions] = useState<DimensionsState>({
        size: { width: 0, height: 0 },
    })
    const { size, dpr } = dimensions

    const containerRef = useRef<HTMLDivElement>(null)

    const handleResize = (): void => {
        const container = containerRef.current!
        setDimensions({
            size: {
                width: container.offsetWidth,
                height: container.offsetHeight,
            },
        })
    }

    // Set canvas size on mount
    useLayoutEffect(handleResize, [])

    const canvasRef = React.useRef<HTMLCanvasElement>(null!)
    const [block, setBlock] = React.useState<SetBlock>(false)
    const [error, setError] = React.useState<any>(false)

    // Suspend this component if block is a promise (2nd run)
    if (block) throw block
    // Throw exception outwards if anything within canvas throws
    if (error) throw error

    // Only render the R3F tree once we have recorded dimensions for the canvas.
    if (size.width > 0 && size.height > 0) {
        render(
            <ErrorBoundary set={setError}>
                <React.Suspense fallback={<Block set={setBlock} />}>
                    <MotionCanvasContext.Provider
                        value={{ setDimensions, layoutCamera }}
                    >
                        <MotionConfigContext.Provider value={configContext}>
                            <MotionContext.Provider value={motionContext}>
                                {children}
                            </MotionContext.Provider>
                        </MotionConfigContext.Provider>
                    </MotionCanvasContext.Provider>
                </React.Suspense>
            </ErrorBoundary>,
            canvasRef.current,
            {
                ...props,
                dpr: dpr || props.dpr,
                size,
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

export const MotionCanvas = forwardRef(CanvasComponent)
