import { frame, motion, useMotionValue, useSpring } from "framer-motion"
import { useEffect, useRef, useState } from "react"

const spring = {
    stiffness: 300,
    damping: 28,
    restDelta: 0.001,
    restSpeed: 0.001,
}

const useMousePosition = () => {
    const [mousePosition, setMousePosition] = useState({ x: null, y: null })

    const updateMousePosition = (e) => {
        setMousePosition({ x: e.clientX, y: e.clientY })
    }

    useEffect(() => {
        window.addEventListener("mousemove", updateMousePosition)

        return () =>
            window.removeEventListener("mousemove", updateMousePosition)
    }, [])

    return mousePosition
}

function DragExample() {
    const dragX = useMotionValue(0)
    const dragY = useMotionValue(0)
    const x = useSpring(dragX)
    const y = useSpring(dragY, spring)
    return (
        <motion.div
            drag
            dragMomentum={false}
            _dragX={dragX}
            _dragY={dragY}
            style={{ width: 100, height: 100, background: "red", x, y }}
        >
            Drag
        </motion.div>
    )
}

function RerenderExample() {
    const { x, y } = useMousePosition()
    const size = 40
    const ref = useRef<HTMLDivElement>(null)
    console.log(x)
    return (
        <motion.div
            ref={ref}
            animate={{ x }}
            transition={spring}
            style={{
                width: 100,
                height: 100,
                background: "green",
                position: "absolute",
                inset: 0,
            }}
        >
            Rerender
        </motion.div>
    )
}

function MouseEventExample() {
    const xPoint = useMotionValue(0)
    const yPoint = useMotionValue(0)
    const x = useSpring(xPoint, spring)
    const y = useSpring(yPoint, spring)
    const ref = useRef<HTMLDivElement>(null)
    const onMove = useRef<(event: MouseEvent) => void>(
        ({ clientX, clientY }: MouseEvent) => {
            const element = ref.current!

            xPoint.set(clientX - element.offsetLeft - element.offsetWidth / 2)
            yPoint.set(clientY - element.offsetTop - element.offsetHeight / 2)
        }
    )

    function startPointer() {
        window.addEventListener("pointermove", onMove.current)
    }

    function cancelPointer() {
        window.removeEventListener("pointermove", onMove.current)
    }

    return (
        <motion.div
            ref={ref}
            style={{ width: 100, height: 100, background: "yellow", x, y }}
            onTapStart={startPointer}
            onTapCancel={cancelPointer}
            onTap={cancelPointer}
        >
            Mouse Event
        </motion.div>
    )
}

function AnimationExample() {
    const x = useMotionValue(0)
    const xSpring = useSpring(x)

    return (
        <div style={{ width: 100, height: 100, position: "relative" }}>
            <motion.div
                animate={{
                    x: [-200, 200],
                    transition: {
                        duration: 1,
                        repeat: Infinity,
                        repeatType: "reverse",
                    },
                }}
                style={{ width: 100, height: 100, background: "lightblue", x }}
            />
            <motion.div
                style={{
                    width: 100,
                    height: 100,
                    position: "absolute",
                    top: 0,
                    left: 0,
                    background: "lightblue",
                    opacity: 0.5,
                    x: xSpring,
                }}
            />
        </div>
    )
}

export function App() {
    return (
        <div style={{ display: "flex", gap: 100 }}>
            <DragExample />
            <MouseEventExample />
            <RerenderExample />
            {/* <AnimationExample /> */}
        </div>
    )
}
