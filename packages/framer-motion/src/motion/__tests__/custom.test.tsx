import { render } from "../../../jest.setup"
import { motion, createMotionComponent, useMotionValue } from "../.."
import * as React from "react"
import { ForwardedRef } from "react"
import { MotionProps } from "../types"

interface Props {
    foo: boolean
}

function runTests(name: string, motionFactory: any) {
    describe(name, () => {
        test("accepts custom types", () => {
            const BaseComponent = React.forwardRef(
                (_props: Props, ref: ForwardedRef<HTMLDivElement>) => {
                    return <div ref={ref} />
                }
            )

            const MotionComponent = motionFactory(BaseComponent)

            const Component = () => <MotionComponent foo />

            render(<Component />)
        })

        test("doesn't forward motion props but does forward custom props", () => {
            let animate: any
            let foo: boolean = false
            const BaseComponent = React.forwardRef(
                (props: Props, ref: ForwardedRef<HTMLDivElement>) => {
                    animate = (props as any).animate
                    foo = props.foo
                    return <div ref={ref} />
                }
            )

            const MotionComponent = motionFactory(BaseComponent)

            const Component = () => <MotionComponent foo animate={{ x: 100 }} />

            render(<Component />)

            expect(animate).toBeUndefined()
            expect(foo).toBe(true)
        })

        test("forwards MotionProps if forwardMotionProps is defined", () => {
            let animate: any
            let foo: boolean = false
            const BaseComponent = React.forwardRef(
                (
                    props: React.PropsWithChildren<Props & MotionProps>,
                    ref: ForwardedRef<HTMLDivElement>
                ) => {
                    animate = props.animate
                    foo = props.foo
                    return <div ref={ref} />
                }
            )

            const MotionComponent = motionFactory(BaseComponent, {
                forwardMotionProps: true,
            })

            const Component = () => <MotionComponent foo animate={{ x: 100 }} />

            render(<Component />)

            expect(animate).toEqual({ x: 100 })
            expect(foo).toBe(true)
        })

        test("forwards MotionValue children as raw values", () => {
            let children: number
            const BaseComponent = React.forwardRef(
                (
                    props: React.PropsWithChildren<Props & MotionProps>,
                    ref: ForwardedRef<HTMLDivElement>
                ) => {
                    children = props.children as any
                    return <div ref={ref} />
                }
            )

            const MotionComponent = motionFactory(BaseComponent)

            const Component = () => (
                <MotionComponent foo>{useMotionValue(5)}</MotionComponent>
            )

            render(<Component />)

            expect(children!).toEqual(5)
        })
    })
}

runTests("createMotionComponent()", createMotionComponent)
runTests("motion.create()", motion.create)
