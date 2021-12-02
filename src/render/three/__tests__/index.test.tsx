import * as React from "react"
import { Canvas } from "@react-three/fiber"
import { render } from "../../../../jest.setup"
import { motion } from "../motion"
import { ResolvedValues } from "../../types"

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
        const result = await new Promise((resolve) => {
            const output: ResolvedValues[] = []

            function Component() {
                return (
                    <Canvas>
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
                            rotation={[1, 2, 3]}
                            onUpdate={(latest) => output.push(latest)}
                            onAnimationComplete={() => resolve(output)}
                            transition={{ duration: 0.1 }}
                        />
                    </Canvas>
                )
            }

            const { rerender } = render(<Component />)
            rerender(<Component />)
        })
        console.log(result)
    })

    // test("whileHover", async () => {
    //     render()
    // })

    // test("onHoverStart", async () => {
    //     render()
    // })

    // test("onHoverEnd", async () => {
    //     render()
    // })

    // test("whileTap", async () => {
    //     render()
    // })

    // test("onTap", async () => {
    //     render()
    // })

    // test("onTapCancel", async () => {
    //     render()
    // })
})
