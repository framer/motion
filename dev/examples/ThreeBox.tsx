/* eslint-disable react/jsx-pascal-case */
import * as React from "react"
import * as Three from "three"
import { useState } from "react"
import { motion } from "../../src/render/three/motion"
import { AnimatePresence } from "@framer"
import { Canvas } from "react-three-fiber"

const GRID_SIZE = 3
const COLOR = [
    "#06f",
    "#09f",
    "#0c8",
    "#9c2",
    "#fb0",
    "#f81",
    "#e14",
    "#e4b",
    "#85f",
]
const COLORS = [...COLOR, ...COLOR, ...COLOR]

function getGridPosition(index: number, size: number, factor: number) {
    const row = Math.floor(index / size)
    const column = index % size

    return [(row - size / 2) * factor, (column - size / 2) * factor]
}

function createVariants(index = 0) {
    return {
        big: {
            scale: 1.6,
            rotateX: 0,
            rotateY: 0,
            color: COLORS[index],
        },
        small: {
            scale: 1,
            rotateX: 1,
            rotateY: 1,
            opacity: 1,
            color: COLORS[index + 1],
        },
        med: {
            scale: 1.3,
            rotateX: 0.2,
            rotateY: 0.2,
            opacity: 1,
            color: COLORS[index + 2],
        },
        gone: {
            scale: 0,
            rotateX: -1,
            rotateY: -1,
            opacity: 0,
            color: "#fff",
            transition: { duration: 3 },
        },
    }
}

const variants = [...Array(1 + GRID_SIZE * GRID_SIZE).keys()].map(
    createVariants
)

export const App = () => {
    const [show, setShow] = useState(true)

    return (
        <div style={{ position: "fixed", inset: 0, background: "#fff" }}>
            <Canvas colorManagement style={{ width: "100vw", height: "100vh" }}>
                <ambientLight intensity={1} color="#fff" />
                <pointLight
                    position={[100, 100, 100]}
                    intensity={1.2}
                    color="#fff"
                />
                <motion.group
                    position={[2, 0, 0]}
                    initial={{ scale: 1 }}
                    animate={{ scale: 1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <motion.group>
                        <mesh onClick={() => setShow(!show)}>
                            <meshStandardMaterial attach="material" />
                            <boxBufferGeometry
                                attach="geometry"
                                args={[1, 1, 1]}
                            />
                        </mesh>
                    </motion.group>
                </motion.group>
                <AnimatePresence>
                    {show && (
                        <>
                            <motion.group>
                                <motion.mesh
                                    variants={variants[0]}
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
                                    <meshStandardMaterial attach="material" />
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
                                                variants={variants[1 + index]}
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
                                                <meshStandardMaterial attach="material" />
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
