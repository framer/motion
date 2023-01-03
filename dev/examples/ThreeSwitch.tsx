import * as React from "react"
import { useState, Suspense, useCallback, useRef, useEffect } from "react"
import "@react-three/fiber"
import styled from "styled-components"
import {
    motion as motionDom,
    useMotionValue,
    MotionConfig,
    useSpring,
} from "framer-motion"
import { motion, MotionCanvas, LayoutCamera } from "framer-motion-3d"
import { softShadows, Shadow, useGLTF, useTexture } from "@react-three/drei"
import { Canvas, useThree, useFrame } from "@react-three/fiber"
import { degToRad } from "three/src/math/MathUtils"
import { extend } from "@react-three/fiber"
import {
    AmbientLight,
    PointLight,
    DirectionalLight,
    Group,
    Mesh,
    SphereGeometry,
    MeshPhysicalMaterial,
    CanvasTexture,
    MeshBasicMaterial,
    PlaneBufferGeometry,
    SphereBufferGeometry,
    MeshStandardMaterial,
    BoxBufferGeometry,
    ShadowMaterial,
    PlaneGeometry,
    SpotLight,
} from "three"

extend({
    AmbientLight,
    PointLight,
    DirectionalLight,
    Group,
    Mesh,
    SphereGeometry,
    MeshPhysicalMaterial,
    CanvasTexture,
    MeshBasicMaterial,
    PlaneBufferGeometry,
    SphereBufferGeometry,
    MeshStandardMaterial,
    BoxBufferGeometry,
    ShadowMaterial,
    PlaneGeometry,
    SpotLight,
})

softShadows()

function Switch({ isOn, setOn }) {
    const onClick = useCallback(() => setOn(!isOn), [isOn])

    const lightVariants = {
        on: { color: "#888" },
        off: { color: "#000" },
    }

    return (
        <group scale={[1.25, 1.25, 1.25]} dispose={null}>
            <motion.group
                position-y={0.85}
                variants={{
                    on: { z: -1.2 },
                    off: { z: 1.2 },
                }}
            >
                <motion.mesh
                    receiveShadow
                    castShadow
                    variants={{
                        on: { rotateX: 0 },
                        off: { rotateX: Math.PI * 1.3 },
                    }}
                    onClick={onClick}
                    {...useCursor()}
                >
                    <sphereGeometry args={[0.8, 64, 64]} />
                    <motion.meshStandardMaterial roughness={0.5} />
                </motion.mesh>
                <motion.pointLight
                    intensity={100}
                    distance={1.4}
                    variants={lightVariants}
                />
                <Shadow
                    renderOrder={-1000}
                    position={[0, -1, 0]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    scale={[1, 1, 1]}
                />
            </motion.group>
        </group>
    )
}

export const transition = {
    type: "spring",
    mass: 5,
    stiffness: 1000,
    damping: 50,
    restDelta: 0.0001,
}

export function useAnimatedText(target, textTransition) {
    const ref = useRef(null)
    const value = useSpring(target, textTransition)

    useEffect(() => {
        ref.current.innerText = target.toFixed(2)

        return value.on("change", (v) => {
            ref.current.innerText = v.toFixed(2)
        })
    })
    useEffect(() => value.set(target), [target])

    return ref
}

export function useCursor() {
    const [hovered, setHover] = useState(false)
    useEffect(
        () => void (document.body.style.cursor = hovered ? "pointer" : "auto"),
        [hovered]
    )

    return {
        onPointerOver: () => setHover(true),
        onPointerOut: () => setHover(false),
    }
}

export function Scene({ isOn, setOn }) {
    return (
        <MotionCanvas
            orthographic
            shadows
            dpr={[1, 2]}
            camera={{ zoom: 60, position: [-5, 5, 5], fov: 90 }}
        >
            <motion.group initial={false} animate={isOn ? "on" : "off"}>
                <ambientLight intensity={0.1} />
                <directionalLight position={[-20, 20, 20]} intensity={1} />
                <motion.directionalLight
                    position={[-20, -20, -20]}
                    intensity={0.5}
                    variants={colorVariants}
                />
                <motion.pointLight
                    position={[0, 0, 5]}
                    distance={5}
                    intensity={5}
                    variants={colorVariants}
                />
                <motion.spotLight
                    variants={colorVariants}
                    position={[10, 20, 20]}
                    angle={0.1}
                    intensity={2}
                    shadow-mapSize-width={2048}
                    shadow-mapSize-height={2048}
                    shadow-bias={-0.00001}
                    castShadow
                />
                <Suspense fallback={null}>
                    <Switch isOn={isOn} setOn={setOn} />
                </Suspense>
                <mesh
                    receiveShadow
                    renderOrder={1000}
                    position={[0, 0, 0]}
                    rotation={[-Math.PI / 2, 0, 0]}
                >
                    <planeGeometry args={[10, 10]} />
                    <motion.shadowMaterial
                        transparent
                        variants={{
                            on: { opacity: 0.1 },
                            off: { opacity: 0.3 },
                        }}
                    />
                </mesh>
            </motion.group>
        </MotionCanvas>
    )
}

const colorVariants = {
    on: { color: "#7fffd4" },
    off: { color: "#c72f46" },
}

export function App() {
    const [isOn, setOn] = useState(true)
    const headerRef = useAnimatedText(isOn ? 8 : 9, transition)

    return (
        <MotionConfig transition={transition}>
            <motion.div
                className="container"
                initial={false}
                animate={{
                    backgroundColor: isOn ? "#c9ffed" : "#ff2558",
                    color: isOn ? "#7fffd4" : "#c70f46",
                }}
            >
                <h1 className="open" children="<h1>" />
                <h1 className="close" children="</h1>" />
                <motion.h1 ref={headerRef} />
                <Scene isOn={isOn} setOn={setOn} />
            </motion.div>
        </MotionConfig>
    )
}

const Container = styled.div`
    .container {
        width: 200px;
        height: 200px;
        z-index: 0;
        background: #a2b9e7;
    }

    canvas {
        cursor: pointer;
    }

    [data-is-fullscreen="true"] .container {
        position: fixed;
        inset: 0;
        width: auto;
        height: auto;
    }

    h1 {
        z-index: 1;
        display: block;
        position: relative;
        font-size: 36px;
        line-height: 1;
    }

    [data-is-fullscreen="true"] h1 {
        position: fixed;
        top: 80px;
        font-size: 24px;
    }
`
