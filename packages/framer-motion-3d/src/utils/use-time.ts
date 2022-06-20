import { useFrame } from "@react-three/fiber"
import { MotionConfigContext, useMotionValue } from "framer-motion"
import { useContext } from "react"

export function useTime() {
    const time = useMotionValue(0)
    const isStatic = useContext(MotionConfigContext)["isStatic"] // Internal API

    !isStatic && useFrame((state) => time.set(state.clock.getElapsedTime()))

    return time
}
