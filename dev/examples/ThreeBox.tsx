import * as React from "react"
import { useRef, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { motion } from "@framer/render/three/motion"

/**
 * An example of firing an animation onMount using the useAnimation hook
 */

function Box(props) {
    // Hold state for hovered and clicked events
    const [clicked, click] = useState(false)

    // Subscribe this component to the render-loop, rotate the mesh every frame
    // useFrame((state, delta) => (ref.current.rotation.x += 0.01))
    // Return the view, these are regular Threejs elements expressed in JSX
    return (
        <motion.mesh
            {...props}
            scale={[0, 0, 0]}
            variants={{
                visible: { scale: 1 },
                pressed: { scale: 0.8, rotateY: 1 },
                hover: { scale: 1.2 },
            }}
            onClick={(event) => click(!clicked)}
        >
            <boxGeometry args={[1, 1, 1]} />
            <motion.meshStandardMaterial
                color="#09f"
                variants={{
                    visible: { color: "#ffbb00" },
                    hover: { color: "#09f" },
                    pressed: { color: "#8855ff" },
                }}
                transition={{ duration: 0.2 }}
            />
        </motion.mesh>
    )
}

export const App = () => {
    return (
        <motion.div
            style={{ position: "fixed", inset: 0, background: "white" }}
        >
            <Canvas>
                <ambientLight />
                <pointLight position={[10, 10, 10]} />
                <motion.group
                    initial="hidden"
                    animate="visible"
                    variants={{
                        visible: { transition: { staggerChildren: 0.1 } },
                    }}
                >
                    <Box position={[-1.5, 1.5, 0]} />
                    <Box position={[0, 1.5, 0]} />
                    <Box position={[1.5, 1.5, 0]} />
                    <Box position={[-1.5, 0, 0]} />
                    <Box position={[0, 0, 0]} />
                    <Box position={[1.5, 0, 0]} />
                    <Box position={[-1.5, -1.5, 0]} />
                    <Box position={[0, -1.5, 0]} />
                    <Box position={[1.5, -1.5, 0]} />
                </motion.group>
            </Canvas>
        </motion.div>
    )
}
