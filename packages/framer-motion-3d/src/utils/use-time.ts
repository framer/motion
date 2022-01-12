import { useFrame } from "@react-three/fiber"
import { useMotionValue } from "framer-motion"

export function useTime() {
    const time = useMotionValue(0)
    useFrame((state) => time.set(state.clock.getElapsedTime()))
    return time
}
