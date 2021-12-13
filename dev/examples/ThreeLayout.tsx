import * as React from "react"
import { useRef, useState } from "react"
import "@react-three/fiber"
import styled from "styled-components"
import { motion as motionDom, useMotionValue, MotionConfig } from "@framer"
import { motion, MotionCanvas } from "@framer/three-entry"
import { softShadows, Shadow } from "@react-three/drei"

/**
 * Blending layout animations with 3D camera
 */

function Lighting({ isFullscreen }) {
    const progress = useMotionValue(isFullscreen ? 1 : 0)
    const light = useRef()

    // useEffect(() => {
    //   // I use Popmotion to do the 3D animation but any library is fine
    //   // inc react-spring. Hopefully this bit will be possible with Framer Motion
    //   // in the nearish future.
    //   const animation = tween({
    //     from: progress.get(),
    //     to: isOpen ? 1 : 0,
    //     ease: cubicBezier(...settings.curve),
    //     duration: settings.duration * 1000
    //   }).start((v) => progress.set(v));

    //   return () => animation.stop();
    // }, [isOpen]);

    // useFrame((state) => {
    //   const p = progress.get();
    //   state.camera.fov = mix(10, 36, p);
    //   state.camera.position.set(mix(25, 10, p), mix(0.25, 5, p), mix(0, 10, p));

    //   state.camera.lookAt(0, 0, 0);
    //   state.camera.updateProjectionMatrix();

    //   light.current.position.set(mix(4, 0, p), mix(3, 8, p), mix(3, 5, p));
    // });

    return (
        <directionalLight
            ref={light}
            castShadow
            intensity={1.5}
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-far={20}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
        />
    )
}

export function Three({ isFullscreen }) {
    return (
        <MotionCanvas layout dpr={[1, 2]} shadowMap state={isFullscreen}>
            <ambientLight intensity={0.2} />
            <pointLight
                position={[-10, -10, 10]}
                intensity={2}
                color="#ff20f0"
            />
            <pointLight
                position={[0, 0.5, -1]}
                distance={1}
                intensity={2}
                color="#e4be00"
            />
            <group position={[0, -0.9, -3]}>
                <mesh
                    receiveShadow
                    castShadow
                    rotation-x={-Math.PI / 2}
                    position-z={2}
                    scale={[4, 20, 0.2]}
                >
                    <boxBufferGeometry />
                    <meshStandardMaterial color="hotpink" />
                </mesh>
                <mesh
                    receiveShadow
                    castShadow
                    rotation-x={-Math.PI / 2}
                    position-y={1}
                    scale={[4.2, 0.2, 4]}
                >
                    <boxBufferGeometry />
                    <meshStandardMaterial color="#e4be00" />
                </mesh>
                <mesh
                    receiveShadow
                    castShadow
                    rotation-x={-Math.PI / 2}
                    position={[-1.7, 1, 3.5]}
                    scale={[0.5, 4, 4]}
                >
                    <boxBufferGeometry />
                    <meshStandardMaterial color="#736fbd" />
                </mesh>
                <mesh
                    receiveShadow
                    castShadow
                    rotation-x={-Math.PI / 2}
                    position={[0, 4.5, 3]}
                    scale={[2, 0.03, 4]}
                >
                    <boxBufferGeometry />
                    <meshStandardMaterial color="white" />
                </mesh>
            </group>
            <mesh receiveShadow castShadow>
                <sphereBufferGeometry args={[0.75, 64, 64]} />
                <meshPhysicalMaterial
                    color="#e7b056"
                    clearcoat={1}
                    clearcoatRoughness={0}
                />
                <Shadow
                    position-y={-0.79}
                    rotation-x={-Math.PI / 2}
                    opacity={0.6}
                    scale={[0.8, 0.8, 1]}
                />
            </mesh>
            <Lighting isFullscreen={isFullscreen} />
        </MotionCanvas>
    )
}

export const App = () => {
    const [isFullscreen, setIsFullscreen] = useState(false)

    return (
        <Container
            data-is-fullscreen={isFullscreen}
            onClick={() => setIsFullscreen(!isFullscreen)}
        >
            <MotionConfig transition={{ duration: 4 }}>
                <Content>
                    <motionDom.div className="canvas-container" layout>
                        <Three isFullscreen={isFullscreen} />
                    </motionDom.div>
                    <motionDom.h1
                        layout
                        animate={{ color: isFullscreen ? "#fff" : "#000" }}
                    >
                        {`Framer Motion`}
                        <br />
                        {`React Three Fiber`}
                    </motionDom.h1>
                    <motionDom.p
                        layout
                        animate={{ opacity: isFullscreen ? 0 : 1 }}
                    >
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Suspendisse vel diam dapibus, laoreet augue at, tempus
                        ex.
                    </motionDom.p>
                </Content>
            </MotionConfig>
        </Container>
    )
}

const Container = styled.div`
    flex-direction: row-reverse;
    justify-content: center;
    align-items: stretch;
    padding: 100px 0 200px 100px;
    width: 1100px;
    height: 500px;
    position: relative;

    &[data-is-fullscreen="true"] {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: auto;
        height: auto;
    }

    &[data-is-fullscreen="true"] h1 {
        position: absolute;
        top: 200px;
        left: 144px;
    }

    &[data-is-fullscreen="true"] p {
        position: absolute;
        left: -550px;
        top: 480px;
    }

    &[data-is-fullscreen="true"] .canvas-container {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: auto;
        height: auto;
    }

    .canvas-container {
        background: #a2b9e7;
        width: 600px;
        height: 500px;
    }
`

const Content = styled.div`
    margin-right: 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-end;

    h1 {
        font-size: 54px;
        line-height: 54px;
        white-space: nowrap;
        text-align: right;
        text-transform: uppercase;
    }

    p {
        width: 500px;
        font-size: 24px;
        text-align: right;
        font-weight: 400;
    }
`
