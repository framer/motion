import * as React from "react"
import { useState } from "react"
import { motion } from "../../src/render/three/motion"
import { AnimatePresence } from "@framer"
import { Canvas } from "react-three-fiber"

const variants = {
    big: { scale: 2, rotateX: 0, rotateY: 0, color: "#0066FF" },
    small: {
        scale: 1,
        rotateX: 1,
        rotateY: 1,
        opacity: 1.0,
        color: "#0099FF",
    },
    gone: {
        scale: 0,
        rotateX: -1,
        rotateY: -1,
        opacity: 0.0,
        color: "#FFFFFF",
    },
}

export const App = () => {
    const [show, setShow] = useState(true)

    return (
        <div style={{ position: "fixed", inset: 0, background: "white" }}>
            <Canvas colorManagement style={{ width: "100vw", height: "100vh" }}>
                <mesh position={[2, 0, 0]} onClick={() => setShow(!show)}>
                    <meshBasicMaterial attach="material" />
                    <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
                </mesh>

                <AnimatePresence>
                    {show && (
                        <motion.group>
                            <motion.mesh
                                variants={variants}
                                initial={"gone"}
                                exit={"gone"}
                                animate={"small"}
                                whileHover={"big"}
                                transition={{
                                    duration: 0.5,
                                    type: "spring",
                                    bounce: 0.3,
                                }}
                            >
                                <meshBasicMaterial
                                    attach="material"
                                    transparent
                                />
                                <boxBufferGeometry
                                    attach="geometry"
                                    args={[1, 1, 1]}
                                />
                            </motion.mesh>
                        </motion.group>
                    )}
                </AnimatePresence>
            </Canvas>
        </div>
    )
}
