import { render } from "../../../../jest.setup"
import * as React from "react"
import { AnimatePresence, motion } from "../../.."
import { motionValue } from "../../../value"
import { act } from "react-dom/test-utils"

describe("AnimatePresence", () => {
    test("Does nothing on initial render by default", async () => {
        const promise = new Promise(resolve => {
            const x = motionValue(0)
            const Component = () => {
                setTimeout(() => resolve(x.get()), 75)
                return (
                    <React.StrictMode>
                        <AnimatePresence>
                            <motion.div
                                animate={{ x: 100 }}
                                style={{ x }}
                                exit={{ x: 0 }}
                            />
                        </AnimatePresence>
                    </React.StrictMode>
                )
            }

            const { rerender } = render(<Component />)
            rerender(<Component />)
        })

        const x = await promise
        expect(x).not.toBe(0)
        expect(x).not.toBe(100)
    })

    test("Suppresses initial animation if `initial={false}`", async () => {
        const promise = new Promise(resolve => {
            const Component = () => {
                return (
                    <React.StrictMode>
                        <AnimatePresence initial={false}>
                            <motion.div
                                initial={{ x: 0 }}
                                animate={{ x: 100 }}
                                exit={{ opacity: 0 }}
                            />
                        </AnimatePresence>
                    </React.StrictMode>
                )
            }

            const { container, rerender } = render(<Component />)
            rerender(<Component />)

            setTimeout(() => {
                resolve(container.firstChild as Element)
            }, 50)
        })

        const element = await promise
        expect(element).toHaveStyle(
            "transform: translateX(100px) translateZ(0)"
        )
    })

    test("Animates out a component when its removed", async () => {
        const promise = new Promise<Element | null>(resolve => {
            const opacity = motionValue(1)
            const Component = ({ isVisible }: { isVisible: boolean }) => {
                return (
                    <React.StrictMode>
                        <AnimatePresence>
                            {isVisible && (
                                <motion.div
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.1 }}
                                    style={{ opacity }}
                                />
                            )}
                        </AnimatePresence>
                    </React.StrictMode>
                )
            }

            const { container, rerender } = render(<Component isVisible />)
            rerender(<Component isVisible />)
            rerender(<Component isVisible={false} />)
            rerender(<Component isVisible={false} />)

            // Check it's animating out
            setTimeout(() => {
                expect(opacity.get()).not.toBe(1)
                expect(opacity.get()).not.toBe(0)
            }, 50)

            // Check it's gone
            setTimeout(() => {
                resolve(container.firstChild as Element | null)
            }, 150)
        })

        const child = await promise
        expect(child).toBeFalsy()
    })

    test("Animates a component back in if it's re-added before animating out", async () => {
        const promise = new Promise<Element | null>(resolve => {
            const Component = ({ isVisible }: { isVisible: boolean }) => {
                return (
                    <React.StrictMode>
                        <AnimatePresence>
                            {isVisible && (
                                <motion.div
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.1 }}
                                />
                            )}
                        </AnimatePresence>
                    </React.StrictMode>
                )
            }

            const { container, rerender } = render(<Component isVisible />)
            rerender(<Component isVisible />)

            setTimeout(() => {
                rerender(<Component isVisible={false} />)
                rerender(<Component isVisible={false} />)

                setTimeout(() => {
                    rerender(<Component isVisible />)
                    rerender(<Component isVisible />)

                    setTimeout(() => {
                        resolve(container.firstChild as Element | null)
                    }, 150)
                }, 50)
            }, 50)
        })

        const child = await promise
        expect(child).toHaveStyle("opacity: 1;")
    })

    test("Animates a component out after having an animation cancelled", async () => {
        const promise = new Promise<Element | null>(resolve => {
            const opacity = motionValue(1)
            const Component = ({ isVisible }: { isVisible: boolean }) => {
                return (
                    <React.StrictMode>
                        <AnimatePresence>
                            {isVisible && (
                                <motion.div
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.1 }}
                                    style={{ opacity }}
                                />
                            )}
                        </AnimatePresence>
                    </React.StrictMode>
                )
            }

            const { container, rerender } = render(<Component isVisible />)
            rerender(<Component isVisible />)
            rerender(<Component isVisible={false} />)
            rerender(<Component isVisible={false} />)
            rerender(<Component isVisible />)
            rerender(<Component isVisible />)
            rerender(<Component isVisible={false} />)
            rerender(<Component isVisible={false} />)

            // Check it's animating out
            setTimeout(() => {
                expect(opacity.get()).not.toBe(1)
                expect(opacity.get()).not.toBe(0)
            }, 50)

            // Check it's gone
            setTimeout(() => {
                resolve(container.firstChild as Element | null)
            }, 300)
        })

        const child = await promise
        expect(child).toBeFalsy()
    })

    test("Can cycle through multiple components", async () => {
        const promise = new Promise<number>(resolve => {
            const Component = ({ i }: { i: number }) => {
                return (
                    <React.StrictMode>
                        <AnimatePresence>
                            <motion.div
                                key={i}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                            />
                        </AnimatePresence>
                    </React.StrictMode>
                )
            }

            const { container, rerender } = render(<Component i={0} />)
            rerender(<Component i={0} />)
            setTimeout(() => {
                rerender(<Component i={1} />)
                rerender(<Component i={1} />)
            }, 50)
            setTimeout(() => {
                rerender(<Component i={2} />)
                rerender(<Component i={2} />)
                resolve(container.childElementCount)
            }, 400)
        })

        return await expect(promise).resolves.toBe(3)
    })

    test("Only renders one child at a time if exitBeforeEnter={true}", async () => {
        const promise = new Promise<number>(resolve => {
            const Component = ({ i }: { i: number }) => {
                return (
                    <React.StrictMode>
                        <AnimatePresence exitBeforeEnter>
                            <motion.div
                                key={i}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                            />
                        </AnimatePresence>
                    </React.StrictMode>
                )
            }

            const { container, rerender } = render(<Component i={0} />)
            rerender(<Component i={0} />)
            setTimeout(() => {
                rerender(<Component i={1} />)
                rerender(<Component i={1} />)
            }, 50)
            setTimeout(() => {
                rerender(<Component i={2} />)
                rerender(<Component i={2} />)
                resolve(container.childElementCount)
            }, 150)
        })

        return await expect(promise).resolves.toBe(1)
    })

    test("Exit variants are triggered with `AnimatePresence.custom`, not that of the element.", async () => {
        const variants = {
            enter: { x: 0, transition: { type: false } },
            exit: (i: number) => ({ x: i * 100, transition: { type: false } }),
        }
        const promise = new Promise(resolve => {
            const x = motionValue(0)
            const Component = ({
                isVisible,
                onAnimationComplete,
            }: {
                isVisible: boolean
                onAnimationComplete?: () => void
            }) => {
                return (
                    <React.StrictMode>
                        <AnimatePresence
                            custom={2}
                            onExitComplete={onAnimationComplete}
                        >
                            {isVisible && (
                                <motion.div
                                    custom={1}
                                    variants={variants}
                                    initial="exit"
                                    animate="enter"
                                    exit="exit"
                                    style={{ x }}
                                />
                            )}
                        </AnimatePresence>
                    </React.StrictMode>
                )
            }

            const { rerender } = render(<Component isVisible />)
            rerender(<Component isVisible />)

            rerender(
                <Component
                    isVisible={false}
                    onAnimationComplete={() => resolve(x.get())}
                />
            )

            rerender(
                <Component
                    isVisible={false}
                    onAnimationComplete={() => resolve(x.get())}
                />
            )
        })

        const resolvedX = await promise
        expect(resolvedX).toBe(200)
    })

    test("Exit propagates through variants", async () => {
        const variants = {
            enter: { opacity: 1, transition: { type: false } },
            exit: { opacity: 0, transition: { type: false } },
        }

        const promise = new Promise<number>(resolve => {
            const opacity = motionValue(1)
            const Component = ({ isVisible }: { isVisible: boolean }) => {
                return (
                    <React.StrictMode>
                        <AnimatePresence>
                            {isVisible && (
                                <motion.div
                                    initial="enter"
                                    animate="enter"
                                    exit="exit"
                                    variants={variants}
                                >
                                    <motion.div variants={variants}>
                                        <motion.div
                                            variants={variants}
                                            style={{ opacity }}
                                        />
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </React.StrictMode>
                )
            }

            let rerender: any

            act(() => {
                rerender = render(<Component isVisible />).rerender
            })

            act(() => {
                rerender(<Component isVisible={false} />)
            })

            resolve(opacity.get())
        })

        return await expect(promise).resolves.toBe(0)
    })

    test("Handles external refs on a single child", async () => {
        const promise = new Promise(resolve => {
            const ref = React.createRef<HTMLDivElement>()
            const Component = ({ id }: { id: number }) => {
                return (
                    <React.StrictMode>
                        <AnimatePresence initial={false}>
                            <motion.div
                                data-id={id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                key={id}
                                ref={ref}
                            />
                        </AnimatePresence>
                    </React.StrictMode>
                )
            }

            const { rerender } = render(<Component id={0} />)
            rerender(<Component id={0} />)

            setTimeout(() => {
                rerender(<Component id={1} />)
                rerender(<Component id={1} />)
                rerender(<Component id={2} />)
                rerender(<Component id={2} />)

                resolve(ref.current)
            }, 30)
        })

        const result = await promise
        return expect(result).toHaveAttribute("data-id", "2")
    })
})

describe("AnimatePresence with custom components", () => {
    test("Does nothing on initial render by default", async () => {
        const promise = new Promise(resolve => {
            const x = motionValue(0)

            const CustomComponent = () => (
                <motion.div
                    animate={{ x: 100 }}
                    style={{ x }}
                    exit={{ x: 0 }}
                />
            )

            const Component = () => {
                setTimeout(() => resolve(x.get()), 75)
                return (
                    <React.StrictMode>
                        <AnimatePresence>
                            <CustomComponent />
                        </AnimatePresence>
                    </React.StrictMode>
                )
            }

            const { rerender } = render(<Component />)
            rerender(<Component />)
        })

        const x = await promise
        expect(x).not.toBe(0)
        expect(x).not.toBe(100)
    })

    test("Suppresses initial animation if `initial={false}`", async () => {
        const promise = new Promise(resolve => {
            const CustomComponent = () => (
                <motion.div
                    initial={{ x: 0 }}
                    animate={{ x: 100 }}
                    exit={{ x: 0 }}
                />
            )

            const Component = () => {
                return (
                    <React.StrictMode>
                        <AnimatePresence initial={false}>
                            <CustomComponent />
                        </AnimatePresence>
                    </React.StrictMode>
                )
            }

            const { container, rerender } = render(<Component />)
            rerender(<Component />)

            setTimeout(() => {
                resolve(container.firstChild as Element)
            }, 50)
        })

        const element = await promise
        expect(element).toHaveStyle(
            "transform: translateX(100px) translateZ(0)"
        )
    })

    test("Animates out a component when its removed", async () => {
        const promise = new Promise<Element | null>(resolve => {
            const opacity = motionValue(1)

            const CustomComponent = () => (
                <motion.div
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    style={{ opacity }}
                />
            )
            const Component = ({ isVisible }: { isVisible: boolean }) => {
                return (
                    <React.StrictMode>
                        <AnimatePresence>
                            {isVisible && <CustomComponent />}
                        </AnimatePresence>
                    </React.StrictMode>
                )
            }

            const { container, rerender } = render(<Component isVisible />)
            rerender(<Component isVisible />)
            rerender(<Component isVisible={false} />)
            rerender(<Component isVisible={false} />)

            // Check it's animating out
            setTimeout(() => {
                expect(opacity.get()).not.toBe(1)
                expect(opacity.get()).not.toBe(0)
            }, 50)

            // Check it's gone
            setTimeout(() => {
                resolve(container.firstChild as Element | null)
            }, 150)
        })

        const child = await promise
        expect(child).toBeFalsy()
    })

    test("Can cycle through multiple components", async () => {
        const promise = new Promise<number>(resolve => {
            const CustomComponent = ({ i }: any) => (
                <motion.div
                    key={i}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                />
            )
            const Component = ({ i }: { i: number }) => {
                return (
                    <React.StrictMode>
                        <AnimatePresence>
                            <CustomComponent key={i} i={i} />
                        </AnimatePresence>
                    </React.StrictMode>
                )
            }

            const { container, rerender } = render(<Component i={0} />)
            rerender(<Component i={0} />)
            setTimeout(() => {
                rerender(<Component i={1} />)
                rerender(<Component i={1} />)
            }, 50)
            setTimeout(() => {
                rerender(<Component i={2} />)
                rerender(<Component i={2} />)
            }, 200)

            setTimeout(() => {
                resolve(container.childElementCount)
            }, 500)
        })

        return await expect(promise).resolves.toBe(3)
    })

    test("Exit variants are triggered with `AnimatePresence.custom`, not that of the element.", async () => {
        const variants = {
            enter: { x: 0, transition: { type: false } },
            exit: (i: number) => ({ x: i * 100, transition: { type: false } }),
        }
        const x = motionValue(0)
        const promise = new Promise(resolve => {
            const CustomComponent = () => (
                <motion.div
                    custom={1}
                    variants={variants}
                    initial="exit"
                    animate="enter"
                    exit="exit"
                    style={{ x }}
                />
            )
            const Component = ({
                isVisible,
                onAnimationComplete,
            }: {
                isVisible: boolean
                onAnimationComplete?: () => void
            }) => {
                return (
                    <React.StrictMode>
                        <AnimatePresence
                            custom={2}
                            onExitComplete={onAnimationComplete}
                        >
                            {isVisible && <CustomComponent />}
                        </AnimatePresence>
                    </React.StrictMode>
                )
            }

            const { rerender } = render(<Component isVisible />)
            rerender(<Component isVisible />)

            rerender(
                <Component
                    isVisible={false}
                    onAnimationComplete={() => resolve(x.get())}
                />
            )

            rerender(
                <Component
                    isVisible={false}
                    onAnimationComplete={() => resolve(x.get())}
                />
            )
        })

        const element = await promise
        expect(element).toBe(200)
    })

    test("Exit propagates through variants", async () => {
        const variants = {
            enter: { opacity: 1 },
            exit: { opacity: 0 },
        }

        const promise = new Promise<number>(resolve => {
            const opacity = motionValue(1)
            const Component = ({ isVisible }: { isVisible: boolean }) => {
                return (
                    <React.StrictMode>
                        <AnimatePresence>
                            {isVisible && (
                                <motion.div
                                    initial="exit"
                                    animate="enter"
                                    exit="exit"
                                    variants={variants}
                                >
                                    <motion.div variants={variants}>
                                        <motion.div
                                            variants={variants}
                                            style={{ opacity }}
                                        />
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </React.StrictMode>
                )
            }

            const { rerender } = render(<Component isVisible />)
            rerender(<Component isVisible />)
            rerender(<Component isVisible={false} />)
            rerender(<Component isVisible={false} />)

            resolve(opacity.get())
        })

        return await expect(promise).resolves.toBe(0)
    })
})
