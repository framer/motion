import * as React from "react"
import { useState } from "react"
import { MotionConfig, motion as motionDom, useTransform } from "framer-motion"
import { motion, MotionCanvas, useTime } from "framer-motion-3d"
import { extend } from "@react-three/fiber"
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
    // Hold state for hovered and clicked events
    const [clicked, click] = useState(false)
    const time = useTime()
    // const scale = useTransform(time, (t) => Math.sin(t) * 0.5 + 1)

    // Subscribe this component to the render-loop, rotate the mesh every frame
    // useFrame((state, delta) => (ref.current.rotation.x += 0.01))
    // Return the view, these are regular Threejs elements expressed in JSX
    return (
        <motion.mesh
            {...props}
            // Uncomment to drive with the useTime-powered motion value, will conflict with animations
            // scale={scale}
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
                opacity={1}
                variants={{
                    visible: { color: "#f00", opacity: 0.5 },
                    hover: { color: "#f00", opacity: 1 },
                    pressed: { color: "#f00", opacity: 1 },
                }}
            />
        </motion.mesh>
    )
}

export const App = () => {
    const [isHovered, setHover] = useState(false)

    return (
        <MotionConfig transition={{ type: "spring", bounce: 0, duration: 0.7 }}>
            <motionDom.div
                style={{ position: "fixed", inset: 0, background: "white" }}
                onHoverStart={() => setHover(true)}
                onHoverEnd={() => setHover(false)}
            >
                <MotionCanvas>
                    <ambientLight />
                    <pointLight position={[10, 10, 10]} />
                    <motion.group
                        animate={isHovered ? "hover" : "visible"}
                        variants={{
                            visible: { transition: { staggerChildren: 0.1 } },
                        }}
                    >
                        <Box
                            animate={{
                                scale: 2,
                                x: 100,
                                y: 200,
                                z: 300,
                                rotateX: 100,
                                rotateY: 200,
                                rotateZ: 300,
                            }}
                            scale={[5, 5, 5]}
                            position={[1, 2, 3]}
                            rotation={[4, 5, 6]}
                            onUpdate={(latest) => console.log({ ...latest })}
                        />
                    </motion.group>
                </MotionCanvas>
            </motionDom.div>
        </MotionConfig>
    )
}
