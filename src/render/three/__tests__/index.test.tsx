import * as React from "react"
import { Canvas } from "@react-three/fiber"
import ReactThreeTestRenderer from "@react-three/test-renderer"
import { render } from "../../../../jest.setup"
import { motion } from "../motion"
import { ResolvedValues } from "../../types"

jest.mock("scheduler", () => require("scheduler/unstable_mock"))

describe("motion for three", () => {
    test("Types work", async () => {
        render(
            <Canvas>
                <motion.mesh animate={{ scale: 2 }} scale={[1, 1, 1]} />
                <motion.meshStandardMaterial color="#000" variants={{}} />
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
})
