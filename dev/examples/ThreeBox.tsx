import * as React from "react"
import { useState } from "react"
import { motion } from "../../src/render/three/motion"
import { AnimatePresence } from "@framer"
import { Canvas } from "react-three-fiber"

const GRID_SIZE = 3

function getGridPosition(index: number, size: number, factor: number) {
    const row = Math.floor(index / size)
    const column = index % size

    return [(row - size / 2) * factor, (column - size / 2) * factor]
}

const variants = {
    big: {
        scale: 2,
        rotateX: 0,
        rotateY: 0,
        color: "#0066FF",
    },
    small: {
        scale: 1,
        rotateX: 1,
        rotateY: 1,
        opacity: 1.0,
        color: "#0099FF",
    },
    med: {
        scale: 1.5,
        rotateX: 0.2,
        rotateY: 0.2,
        opacity: 1.0,
        color: "#0066FF",
    },
    gone: {
        scale: 0,
        rotateX: -1,
        rotateY: -1,
        opacity: 0.0,
        color: "#FFFFFF",
        transition: { duration: 3 },
    },
}

export const App = () => {
    const [show, setShow] = useState(true)

    return (
        <div style={{ position: "fixed", inset: 0, background: "white" }}>
            <Canvas colorManagement style={{ width: "100vw", height: "100vh" }}>
                <mesh
                    // initial={{ scale: 1 }}
                    // whileTap={{ scale: 0.8 }}
                    position={[2, 0, 0]}
                    onClick={() => setShow(!show)}
                >
                    <meshBasicMaterial attach="material" />
                    <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
                </mesh>
                <ambientLight />
                <pointLight position={[150, 150, 150]} intensity={0.55} />
                <AnimatePresence>
                    {show && (
                        <>
                            <motion.group>
                                <motion.mesh
                                    variants={variants}
                                    initial={"gone"}
                                    exit={"gone"}
                                    animate={"small"}
                                    whileHover={"big"}
                                    whileTap={"med"}
                                    transition={{
                                        duration: 0.5,
                                        type: "spring",
                                        bounce: 0.3,
                                    }}
                                >
                                    <meshPhongMaterial attach="material" />
                                    <boxBufferGeometry
                                        attach="geometry"
                                        args={[1, 1, 1]}
                                    />
                                </motion.mesh>
                            </motion.group>
                            <motion.group
                                position={[-2, 0, 0]}
                                rotation={[0, 0, -Math.PI / 2]}
                                transition={{
                                    staggerChildren: 0.1,
                                }}
                                initial={"gone"}
                                exit={"gone"}
                                animate={"small"}
                            >
                                {[...Array(GRID_SIZE * GRID_SIZE).keys()].map(
                                    (index) => {
                                        const [x, y] = getGridPosition(
                                            index,
                                            GRID_SIZE,
                                            0.5
                                        )

                                        return (
                                            <motion.mesh
                                                key={index}
                                                variants={variants}
                                                position={[
                                                    x + 0.25,
                                                    y + 0.25,
                                                    0,
                                                ]}
                                                transition={{
                                                    duration: 0.5,
                                                    type: "spring",
                                                    bounce: 0.3,
                                                }}
                                            >
                                                <meshPhongMaterial attach="material" />
                                                <boxBufferGeometry
                                                    attach="geometry"
                                                    args={[0.2, 0.2, 0.2]}
                                                />
                                            </motion.mesh>
                                        )
                                    }
                                )}
                            </motion.group>
                        </>
                    )}
                </AnimatePresence>
            </Canvas>
        </div>
    )
}
