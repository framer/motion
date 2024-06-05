import { __rest } from "tslib";
import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { useContext, useLayoutEffect, useRef, forwardRef, } from "react";
import { clamp, MotionContext, MotionConfigContext, useForceUpdate, useIsomorphicLayoutEffect, } from "framer-motion";
import { mergeRefs } from "react-merge-refs";
import { createRoot, unmountComponentAtNode, events as createPointerEvents, } from "@react-three/fiber";
import { MotionCanvasContext } from "./MotionCanvasContext";
const devicePixelRatio = typeof window !== "undefined" ? window.devicePixelRatio : 1;
const calculateDpr = (dpr) => Array.isArray(dpr)
    ? clamp(dpr[0], dpr[1], devicePixelRatio)
    : dpr || devicePixelRatio;
/**
 * This file contains a version of R3F's Canvas component that uses our projection
 * system for layout measurements instead of use-react-measure so we can keep the
 * projection and cameras in frame.
 *
 * https://github.com/pmndrs/react-three-fiber/blob/master/packages/fiber/src/web/Canvas.tsx
 */
function Block({ set }) {
    useIsomorphicLayoutEffect(() => {
        set(new Promise(() => null));
        return () => set(false);
    }, []);
    return null;
}
class ErrorBoundary extends React.Component {
    constructor() {
        super(...arguments);
        this.state = { error: false };
    }
    componentDidCatch(error) {
        this.props.set(error);
    }
    render() {
        return this.state.error ? null : this.props.children;
    }
}
ErrorBoundary.getDerivedStateFromError = () => ({ error: true });
function CanvasComponent(_a, forwardedRef) {
    var { children, fallback, tabIndex, id, style, className, events } = _a, props = __rest(_a, ["children", "fallback", "tabIndex", "id", "style", "className", "events"]);
    /**
     * Import existing contexts to pass through variants and MotionConfig from
     * the DOM to the 3D tree. Shared variants aren't officially supported yet
     * because the parent DOM tree fires effects before the 3D tree, whereas
     * variants are expected to run from bottom-up in useEffect.
     */
    const motionContext = useContext(MotionContext);
    const configContext = useContext(MotionConfigContext);
    const [forceRender] = useForceUpdate();
    const layoutCamera = useRef(null);
    const dimensions = useRef({
        size: { width: 0, height: 0 },
    });
    const { size, dpr } = dimensions.current;
    const containerRef = useRef(null);
    const handleResize = () => {
        const container = containerRef.current;
        dimensions.current = {
            size: {
                width: container.offsetWidth,
                height: container.offsetHeight,
            },
        };
        forceRender();
    };
    // Set canvas size on mount
    useLayoutEffect(handleResize, []);
    const canvasRef = React.useRef(null);
    const [block, setBlock] = React.useState(false);
    const [error, setError] = React.useState(false);
    // Suspend this component if block is a promise (2nd run)
    if (block)
        throw block;
    // Throw exception outwards if anything within canvas throws
    if (error)
        throw error;
    const root = useRef(undefined);
    if (size.width > 0 && size.height > 0) {
        if (!root.current) {
            root.current = createRoot(canvasRef.current);
        }
        root.current.configure(Object.assign(Object.assign({}, props), { dpr: dpr || props.dpr, size: Object.assign(Object.assign({}, size), { top: 0, left: 0 }), events: events || createPointerEvents })).render(_jsx(ErrorBoundary, { set: setError, children: _jsx(React.Suspense, { fallback: _jsx(Block, { set: setBlock }), children: _jsx(MotionCanvasContext.Provider, { value: {
                        dimensions,
                        layoutCamera,
                        requestedDpr: calculateDpr(props.dpr),
                    }, children: _jsx(MotionConfigContext.Provider, { value: configContext, children: _jsx(MotionContext.Provider, { value: motionContext, children: children }) }) }) }) }));
    }
    useIsomorphicLayoutEffect(() => {
        const container = canvasRef.current;
        return () => unmountComponentAtNode(container);
    }, []);
    return (_jsx("div", { ref: containerRef, id: id, className: className, tabIndex: tabIndex, style: Object.assign({ position: "relative", width: "100%", height: "100%", overflow: "hidden" }, style), children: _jsx("canvas", { ref: mergeRefs([canvasRef, forwardedRef]), style: { display: "block" }, children: fallback }) }));
}
export const MotionCanvas = forwardRef(CanvasComponent);
//# sourceMappingURL=MotionCanvas.js.map