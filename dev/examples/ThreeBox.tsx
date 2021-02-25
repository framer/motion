import * as React from "react"
import { useState } from "react"
import { motion } from "../../src/render/three/motion"
import { AnimatePresence } from "@framer"
import { Canvas, useFrame } from "react-three-fiber"

function Box(props) {
    const mesh = React.useRef()
    const [hovered, setHover] = React.useState(false)
    const [active, setActive] = React.useState(false)

    useFrame(() => (mesh.current.rotation.x = mesh.current.rotation.y += 0.01))

    return (
        <mesh
            {...props}
            ref={mesh}
            scale={active ? [1.5, 1.5, 1.5] : [1, 1, 1]}
            onClick={(e) => setActive(!active)}
            onPointerOver={(e) => setHover(true)}
            onPointerOut={(e) => setHover(false)}
        >
            <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
            <meshStandardMaterial
                attach="material"
                color={hovered ? "hotpink" : "orange"}
            />
        </mesh>
    )
}

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
    const [hovered, setHover] = React.useState(false)
    const [show, setShow] = useState(true)

    return (
        <Canvas colorManagement style={{ width: "100vw", height: "100vh" }}>
            <mesh position={[2, 0, 0]} onClick={() => setShow(!show)}>
                <meshBasicMaterial attach="material" />
                <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
            </mesh>

            <AnimatePresence>
                {show && (
                    <motion.group>
                        <motion.mesh
                            onPointerOver={() => setHover(true)}
                            onPointerOut={() => setHover(false)}
                            variants={variants}
                            initial={"gone"}
                            exit={"gone"}
                            animate={hovered ? "big" : "small"}
                            transition={{ duration: 10 }}
                        >
                            <meshBasicMaterial attach="material" transparent />
                            <boxBufferGeometry
                                attach="geometry"
                                args={[1, 1, 1]}
                            />
                        </motion.mesh>
                    </motion.group>
                )}
            </AnimatePresence>

            {/* <ambientLight />
            <pointLight position={[10, 10, 10]} />
            <Box position={[-1.2, 0, 0]} />
            <Box position={[1.2, 0, 0]} /> */}
        </Canvas>
    )
}
