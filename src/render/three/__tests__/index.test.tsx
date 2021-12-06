import * as React from "react"
import { useEffect, useRef } from "react"
import { Euler, Vector3 } from "three"
import { Canvas, Object3DNode } from "@react-three/fiber"
import ReactThreeTestRenderer from "@react-three/test-renderer"
import { render } from "../../../../jest.setup"
import { motion } from "../motion"
import { ResolvedValues } from "../../types"
import { MotionValue, motionValue } from "../../../value"

jest.mock("scheduler", () => require("scheduler/unstable_mock"))

describe("motion for three", () => {
    test("Types work", async () => {
        render(
            <Canvas>
                <motion.mesh animate={{ scale: 2 }} scale={[1, 1, 1]}>
                    <motion.meshStandardMaterial color="#000" variants={{}} />
                </motion.mesh>
            </Canvas>
        )
    })

    test("Reads initial value from props", async () => {
        const result = await new Promise<any[]>(async (resolve) => {
            const output: ResolvedValues[] = []

            function Component() {
                return (
                    <motion.mesh
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
                        onUpdate={(latest) => output.push({ ...latest })}
                        onAnimationComplete={() => resolve(output)}
                        transition={{
                            duration: 0.1,
                            // Ensures final frame outputs the exact values they were read at
                            ease: (t) => (t < 0.5 ? t : 0),
                        }}
                    />
                )
            }

            ReactThreeTestRenderer.create(<Component />)
        })

        const lastFrame = result[result.length - 1]
        expect(lastFrame).toEqual({
            scale: 5,
            x: 1,
            y: 2,
            z: 3,
            rotateX: 4,
            rotateY: 5,
            rotateZ: 6,
        })
    })

    test("Reads initial value from scale as number", async () => {
        const result = await new Promise<any[]>(async (resolve) => {
            const output: ResolvedValues[] = []

            function Component() {
                return (
                    <motion.mesh
                        animate={{ scale: 2 }}
                        scale={5}
                        onUpdate={(latest) => output.push({ ...latest })}
                        onAnimationComplete={() => resolve(output)}
                        transition={{
                            duration: 0.1,
                            ease: (t) => (t < 0.5 ? t : 0),
                        }}
                    />
                )
            }

            ReactThreeTestRenderer.create(<Component />)
        })

        const lastFrame = result[result.length - 1]
        expect(lastFrame).toEqual({
            scale: 5,
        })
    })

    test("Reads initial value from drilled props", async () => {
        const result = await new Promise<any[]>(async (resolve) => {
            const output: ResolvedValues[] = []

            function Component() {
                return (
                    <motion.mesh
                        animate={{
                            scaleX: 1,
                            scaleY: 2,
                            scaleZ: 3,
                            x: 100,
                            y: 200,
                            z: 300,
                            rotateX: 100,
                            rotateY: 200,
                            rotateZ: 300,
                        }}
                        position-x={1}
                        position-y={2}
                        position-z={3}
                        rotation-x={4}
                        rotation-y={5}
                        rotation-z={6}
                        scale-x={7}
                        scale-y={8}
                        scale-z={9}
                        onUpdate={(latest) => output.push({ ...latest })}
                        onAnimationComplete={() => resolve(output)}
                        transition={{
                            duration: 0.1,
                            ease: (t) => (t < 0.5 ? t : 0),
                        }}
                    />
                )
            }

            ReactThreeTestRenderer.create(<Component />)
        })

        const lastFrame = result[result.length - 1]
        expect(lastFrame).toEqual({
            x: 1,
            y: 2,
            z: 3,
            rotateX: 4,
            rotateY: 5,
            rotateZ: 6,
            scaleX: 7,
            scaleY: 8,
            scaleZ: 9,
        })
    })

    test("Accepts motion values", async () => {
        const result = await new Promise<Object3DNode<any, any>>((resolve) => {
            const x = motionValue(1)
            const scale = motionValue(2)
            const rotateX = motionValue(3)
            function Component() {
                const ref = useRef(null)
                useEffect(() => {
                    resolve(ref.current as any)
                })
                return (
                    <motion.mesh
                        ref={ref}
                        position-x={x}
                        scale={scale}
                        rotation={[rotateX, 0, 0]}
                        onAnimationComplete={() => resolve([x, scale, rotateX])}
                        transition={{ duration: 0.1 }}
                    />
                )
            }

            ReactThreeTestRenderer.create(<Component />)
        })

        expect((result.position as Vector3).x).toEqual(1)
        expect((result.scale as Vector3).x).toEqual(2)
        expect((result.rotation as Euler).x).toEqual(3)
    })

    test("Animates motion values", async () => {
        const result = await new Promise<MotionValue<number>[]>((resolve) => {
            const x = motionValue(0)
            const scale = motionValue(0)
            const rotateX = motionValue(0)
            function Component() {
                return (
                    <motion.mesh
                        position-x={x}
                        scale={scale}
                        rotation={[rotateX, 0, 0]}
                        animate={{ x: 100, scale: 5, rotateX: 90 }}
                        onAnimationComplete={() => resolve([x, scale, rotateX])}
                        transition={{ duration: 0.1 }}
                    />
                )
            }

            ReactThreeTestRenderer.create(<Component />)
        })

        const [a, b, c] = result
        expect(a.get()).toEqual(100)
        expect(b.get()).toEqual(5)
        expect(c.get()).toEqual(90)
    })
})
