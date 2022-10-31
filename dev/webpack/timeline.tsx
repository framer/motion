import * as React from "react"
import {
    motion,
    Timeline,
    useMotionValue,
    useScroll,
    useTransform,
} from "framer-motion"
import { pointFromVector, mix } from "popmotion"

function Header() {
    const containerRef = React.useRef(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    })

    return (
        <Timeline
            animate={[
                [
                    "container",
                    {
                        scale: [1, 0.5],
                        clipPath: ["inset(0px)", "inset(200px)"],
                    },
                    { duration: 1 },
                ],
                [
                    "line1",
                    { rotateY: [0, 180] },
                    { at: "<", ease: "linear", duration: 1 },
                ],
                [
                    "line2",
                    { rotateY: [0, 160] },
                    { at: "<+0.2", ease: "linear", duration: 1 - 0.2 },
                ],
                [
                    "line3",
                    { rotateY: [0, 140] },
                    { at: "<+0.2", ease: "linear", duration: 1 - 0.4 },
                ],
            ]}
            progress={scrollYProgress}
        >
            <motion.div
                track="container"
                ref={containerRef}
                style={{
                    width: "100vw",
                    height: "100vh",
                    background: "#1300ff",
                    marginBottom: "100vh",
                    transformOrigin: "50% 100%",
                }}
            >
                <h1
                    style={{
                        padding: 300,
                        perspective: 1200,
                        transformStyle: "preserve-3d",
                        width: 300,
                        color: "var(--white)",
                        transform: "scale(2)",
                    }}
                >
                    <motion.span
                        track="line1"
                        style={{
                            display: "inline-block",
                            transformOrigin: "0% 50%",
                        }}
                    >
                        Introducing the
                    </motion.span>
                    <br />
                    <motion.span
                        track="line2"
                        style={{
                            display: "inline-block",
                            transformOrigin: "0% 50%",
                        }}
                    >
                        Framer Motion
                    </motion.span>
                    <br />
                    <motion.code
                        track="line3"
                        style={{
                            fontSize: 24,
                            display: "inline-block",
                            transformOrigin: "0% 50%",
                        }}
                    >
                        {"<Timeline />"}
                    </motion.code>
                </h1>
            </motion.div>
        </Timeline>
    )
}

function Gallery() {
    const containerRef = React.useRef(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    })
    const controlsRef = React.useRef(null)

    const sliderY = useMotionValue(0)
    const sliderRange = [0, 250]

    const cards = [
        "https://framerusercontent.com/images/TFVX2KsRSfU9u3sjd6fjITS0ds.jpg?scale-down-to=1024",
        "https://framerusercontent.com/images/p1t6vBRVo8WKnf6QHXdTqwb4M.jpg?scale-down-to=1024",
        "https://framerusercontent.com/images/qXnZi0puxcHo4AY2QLbQJxEF7s.jpg?scale-down-to=1024",
        "https://framerusercontent.com/images/eZWXiloTe5MN3WZfhmDw5tWl26U.jpg?scale-down-to=1024",
        "https://framerusercontent.com/images/ZZrLnJT9D0gi7TX2RgyUWRz8FSw.jpg?scale-down-to=1024",
        "https://framerusercontent.com/images/8yeyVnxbJkMUsSzG8NCGU0Fhgk.jpg?scale-down-to=1024",
    ]

    const cardMotionValues = cards.map((_, i) => {
        return {
            opacity: useTransform(sliderY, [i * 50, 20 + i * 50], [1, 0]),
            z: useTransform(sliderY, sliderRange, [
                (7 - i) * 10 + -100,
                (7 - i) * 10 + 200,
            ]),
        }
    })

    return (
        <div
            ref={containerRef}
            style={{
                marginBottom: "100vh",
                height: "300vh",
                position: "relative",
            }}
        >
            <div
                style={{
                    position: "sticky",
                    top: 0,
                    height: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    // overflow: "hidden",
                }}
            >
                <Timeline
                    animate={cards.map((_, i) => {
                        const point = pointFromVector(
                            { x: 0, y: 0 },
                            mix(0, 360, Math.random()),
                            mix(300, 800, Math.random())
                        )
                        return [
                            `card${i}`,
                            {
                                x: [-point.x, 0, point.x],
                                y: [-point.y, 0, point.y],
                            },
                            { at: "<" },
                        ]
                    })}
                    progress={scrollYProgress}
                >
                    <div
                        style={{
                            width: 50,
                            height: 300,
                            padding: 5,
                            borderRadius: 50,
                            border: "5px solid var(--red)",
                            position: "absolute",
                            top: "100px",
                            left: "100px",
                        }}
                        ref={controlsRef}
                    >
                        <motion.div
                            style={{
                                width: 50,
                                height: 50,
                                backgroundColor: "var(--red)",
                                borderRadius: "50%",
                                y: sliderY,
                            }}
                            drag="y"
                            dragConstraints={{ top: 0, bottom: 250 }}
                            dragElastic={0.2}
                        />
                    </div>
                    <div
                        style={{
                            position: "relative",
                            width: 250,
                            height: 375,
                            perspective: 1200,
                            transformStyle: "preserve-3d",
                        }}
                    >
                        {cards.map((color, i) => (
                            <motion.div
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    overflow: "hidden",
                                    borderRadius: 20,
                                    ...cardMotionValues[i],
                                }}
                                key={color}
                                track={`card${i}`}
                                whileHover={{ scale: 1.2 }}
                            >
                                <motion.img
                                    style={{
                                        width: 250,
                                        height: 375,
                                    }}
                                    src={color}
                                />
                            </motion.div>
                        ))}
                    </div>
                </Timeline>
            </div>
        </div>
    )
}

export function Button() {
    return (
        <div
            style={{
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: 100,
            }}
        >
            <Timeline
                animate={[
                    [
                        "button",
                        {
                            width: [400, 450, 400],
                            outline: [
                                "0px solid rgba(153, 0, 255, .5)",
                                "50px solid rgba(153, 0, 255, 0)",
                            ],
                        },
                    ],
                ]}
                transition={{ repeat: Infinity, duration: 3 }}
            >
                <motion.div
                    style={{
                        width: 500,
                        height: 120,
                        paddingTop: 20,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                    whileHover="hover"
                    whileTap="pressed"
                >
                    <motion.div
                        track="button"
                        style={{
                            width: 400,
                            height: 100,
                            borderRadius: 50,
                            backgroundColor: "var(--purple)",
                        }}
                        variants={{
                            hover: {
                                width: 320,
                                outline: "0px solid rgba(153, 0, 255, .6)",
                                y: -20,
                            },
                            pressed: {
                                width: 300,
                                y: -15,
                            },
                        }}
                    />
                </motion.div>
                <motion.div
                    style={{
                        width: 500,
                        height: 120,
                        paddingTop: 20,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                    whileHover="hover"
                    whileTap="pressed"
                >
                    <motion.div
                        track="button"
                        style={{
                            width: 400,
                            height: 100,
                            borderRadius: 50,
                            backgroundColor: "var(--purple)",
                        }}
                        variants={{
                            hover: {
                                width: 320,
                                outline: "0px solid rgba(153, 0, 255, .6)",
                                y: -20,
                            },
                            pressed: {
                                width: 300,
                                y: -15,
                            },
                        }}
                    />
                </motion.div>
            </Timeline>
        </div>
    )
}

export const App = () => {
    return (
        <>
            <Header />
            <Gallery />
            <Button />
        </>
    )
}
