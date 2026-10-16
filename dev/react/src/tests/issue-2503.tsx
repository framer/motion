import { AnimatePresence, motion } from "framer-motion"
import { forwardRef, useEffect, useState, version } from "react"

/**
 * Repro for #2503 — "AnimatePresence popLayout does not overlay the component
 * in React Router 6".
 *
 * react-router-dom isn't installed in this dev app, so react-router's
 * <Routes> is substituted with `PlainRoutes`: a plain function component that
 * does not forward refs, which is the same shape as far as PopChild is
 * concerned (it clones its child with a ref).
 *
 * ?variant=plain       — non-forwardRef function component child (the bug)
 * ?variant=spread      — non-forwardRef function component that spreads its
 *                        props onto the motion element (React 19 passes refs
 *                        via props, so this may behave differently to `plain`)
 * ?variant=nested      — non-forwardRef function component whose motion
 *                        element contains another exiting motion element
 * ?variant=forwardref  — same component wrapped in forwardRef (suggested fix)
 * ?variant=wrapped     — child wrapped in a motion.div (suggested fix)
 */

const boxStyles: React.CSSProperties = {
    width: 100,
    height: 100,
}

interface RouteProps {
    id: string
    color: string
}

const Route = ({ id, color }: RouteProps) => (
    <motion.div
        id={id}
        className="route"
        initial={{ x: 100 }}
        animate={{ x: 0 }}
        exit={{ x: -100 }}
        transition={{ duration: 10, ease: "linear" }}
        style={{ ...boxStyles, backgroundColor: color }}
    />
)

/**
 * Stand-in for react-router's <Routes>: a function component with no ref
 * forwarding.
 */
const PlainRoutes = (props: RouteProps) => <Route {...props} />

/**
 * Same, but spreads all props (including a React 19 `props.ref`) onto the
 * underlying motion element.
 */
const SpreadRoutes = ({ id, color, ...rest }: RouteProps) => (
    <motion.div
        {...rest}
        id={id}
        className="route"
        initial={{ x: 100 }}
        animate={{ x: 0 }}
        exit={{ x: -100 }}
        transition={{ duration: 10, ease: "linear" }}
        style={{ ...boxStyles, backgroundColor: color }}
    />
)

/**
 * Function component whose outermost motion element contains another motion
 * element with an exit animation. The outer one should be popped. The inner
 * one mounts after the outer, so it isn't simply the first to register.
 */
const NestedRoutes = ({ id, color }: RouteProps) => {
    const [showInner, setShowInner] = useState(false)
    useEffect(() => setShowInner(true), [])

    return (
        <motion.div
            id={id}
            className="route"
            initial={{ x: 100 }}
            animate={{ x: 0 }}
            exit={{ x: -100 }}
            transition={{ duration: 10, ease: "linear" }}
            style={{ ...boxStyles, backgroundColor: color }}
        >
            {showInner && (
                <motion.div
                    id={`${id}-inner`}
                    exit={{ opacity: 0.5 }}
                    transition={{ duration: 10, ease: "linear" }}
                    style={{ width: 50, height: 50 }}
                />
            )}
        </motion.div>
    )
}

const ForwardRefRoutes = forwardRef<HTMLDivElement, RouteProps>(
    function ForwardRefRoutes({ id, color }, ref) {
        return (
            <motion.div
                ref={ref}
                id={id}
                className="route"
                initial={{ x: 100 }}
                animate={{ x: 0 }}
                exit={{ x: -100 }}
                transition={{ duration: 10, ease: "linear" }}
                style={{ ...boxStyles, backgroundColor: color }}
            />
        )
    }
)

export const App = () => {
    const [path, setPath] = useState("first")
    const variant =
        new URLSearchParams(window.location.search).get("variant") ?? "plain"

    const id = path
    const color = path === "first" ? "red" : "green"

    let child: React.ReactElement
    if (variant === "spread") {
        child = <SpreadRoutes key={path} id={id} color={color} />
    } else if (variant === "nested") {
        child = <NestedRoutes key={path} id={id} color={color} />
    } else if (variant === "forwardref") {
        child = <ForwardRefRoutes key={path} id={id} color={color} />
    } else if (variant === "wrapped") {
        child = (
            <motion.div key={path} id={`wrap-${id}`}>
                <PlainRoutes id={id} color={color} />
            </motion.div>
        )
    } else {
        child = <PlainRoutes key={path} id={id} color={color} />
    }

    return (
        <div id="container" style={{ position: "relative" }}>
            <AnimatePresence mode="popLayout">{child}</AnimatePresence>
            <button
                id="toggle"
                onClick={() =>
                    setPath((p) => (p === "first" ? "second" : "first"))
                }
            >
                toggle
            </button>
            <div id="path">{path}</div>
            <div id="react-version">{version}</div>
        </div>
    )
}
