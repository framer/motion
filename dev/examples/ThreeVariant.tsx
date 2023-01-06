import * as React from "react"
import { MotionConfig, motion as motionDom } from "framer-motion"
import { motion, MotionCanvas } from "framer-motion-3d"
import { Canvas, extend } from "@react-three/fiber"
import {
    AmbientLight,
    PointLight,
    Group,
    BoxGeometry,
    MeshStandardMaterial,
    Mesh,
} from "three"

extend({
    AmbientLight,
    PointLight,
    Group,
    BoxGeometry,
    MeshStandardMaterial,
    Mesh,
})

/**
 * An example of firing an animation onMount using the useAnimation hook
 */

function Box(props) {
    return (
        <motion.mesh
            {...props}
            variants={{
                initial: { scale: 5 },
                animate: { scale: 1, transition: { duration: 10 } },
            }}
            initial="initial"
            animate="animate"
        >
            <boxGeometry args={[1, 1, 1]} />
            <motion.meshStandardMaterial color="#09f" />
        </motion.mesh>
    )
}

export const App = () => {
    return (
        <motionDom.div
            style={{ position: "fixed", inset: 0, background: "white" }}
        >
            <Canvas>
                <ambientLight />
                <pointLight position={[10, 10, 10]} />
                <motion.group>
                    <Box position={[0, 0, 0]} />
                </motion.group>
            </Canvas>
        </motionDom.div>
    )
}
