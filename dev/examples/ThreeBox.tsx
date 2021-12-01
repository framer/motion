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
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { scale: 0 },
                visible: {
                    scale: 1, // clicked ? 2 : 1,
                    // rotateZ: clicked ? 90 : 0,
                },
                pressed: {
                    scale: 0.8,
                },
                hover: { scale: 1.2 },
            }}
            whileTap="pressed"
            whileHover="hover"
            transition={{ type: "spring", stiffness: 1000, damping: 20 }}
            onClick={(event) => click(!clicked)}
        >
            <boxGeometry args={[1, 1, 1]} />
            <motion.meshStandardMaterial
                variants={{
                    hidden: { color: "#ffcc00" },
                    visible: { color: "#ff3366" },
                    hover: { color: "#09f" },
                }}
            />
        </motion.mesh>
    )
}

export const App = () => {
    return (
        <div style={{ position: "fixed", inset: 0, background: "white" }}>
            <Canvas>
                <ambientLight />
                <pointLight position={[10, 10, 10]} />
                <Box position={[1.2, 0, 0]} />
            </Canvas>
        </div>
    )
}
