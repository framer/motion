import "../../../../jest.setup"
import * as React from "react"
import { render } from "@testing-library/react"
import { AnimatePresence, motion } from "../../.."
import { motionValue } from "../../../value"

describe("AnimatePresence", () => {
    test("Does nothing on initial render by default", async () => {
        const promise = new Promise(resolve => {
            const x = motionValue(0)
            const Component = () => {
                setTimeout(() => resolve(x.get()), 75)
                return (
                    <AnimatePresence>
                        <motion.div animate={{ x: 100 }} style={{ x }} />
                    </AnimatePresence>
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
                    <AnimatePresence initial={false}>
                        <motion.div initial={{ x: 0 }} animate={{ x: 100 }} />
                    </AnimatePresence>
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
                    <AnimatePresence>
                        {isVisible && (
                            <motion.div
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.1 }}
                                style={{ opacity }}
                            />
                        )}
                    </AnimatePresence>
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
            const Component = ({ i }: { i: number }) => {
                return (
                    <AnimatePresence>
                        <motion.div
                            key={i}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                        />
                    </AnimatePresence>
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

        return await expect(promise).resolves.toBe(3)
    })

    test("Only renders one child at a time if exitBeforeEnter={true}", async () => {
        const promise = new Promise<number>(resolve => {
            const Component = ({ i }: { i: number }) => {
                return (
                    <AnimatePresence exitBeforeEnter>
                        <motion.div
                            key={i}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                        />
                    </AnimatePresence>
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

describe("AnimatePresence with custom components", () => {
    test("Does nothing on initial render by default", async () => {
        const promise = new Promise(resolve => {
            const x = motionValue(0)

            const CustomComponent = () => (
                <motion.div animate={{ x: 100 }} style={{ x }} />
            )

            const Component = () => {
                setTimeout(() => resolve(x.get()), 75)
                return (
                    <AnimatePresence>
                        <CustomComponent />
                    </AnimatePresence>
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
                <motion.div initial={{ x: 0 }} animate={{ x: 100 }} />
            )

            const Component = () => {
                return (
                    <AnimatePresence initial={false}>
                        <CustomComponent />
                    </AnimatePresence>
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
                    <AnimatePresence>
                        {isVisible && <CustomComponent />}
                    </AnimatePresence>
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
                    <AnimatePresence>
                        <CustomComponent key={i} i={i} />
                    </AnimatePresence>
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
                    <AnimatePresence
                        custom={2}
                        onExitComplete={onAnimationComplete}
                    >
                        {isVisible && <CustomComponent />}
                    </AnimatePresence>
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
