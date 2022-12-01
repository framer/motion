import * as React from "react"
import { useRef, useState } from "react"
import { motion as motionThree, MotionCanvas } from "framer-motion-3d"
import { motion, Variants } from "framer-motion"
import styled from "styled-components"
import { PointLight, Mesh, BoxGeometry, MeshPhongMaterial, Group } from "three"
import { extend } from "@react-three/fiber"

const degreesToRadians = (degrees: number) => (degrees * Math.PI) / 180

extend({
    PointLight,
    Mesh,
    BoxGeometry,
    MeshPhongMaterial,
    Group,
})

export function StarIcon() {
    return (
        <MotionCanvas
            shadows
            dpr={[1, 2]}
            camera={{ position: [0, 0, 5.5], fov: 45 }}
        >
            {lights.map(([x, y, z, intensity]) => (
                <pointLight
                    intensity={intensity}
                    position={[x / 8, y / 8, z / 8]}
                    color="#fff"
                />
            ))}
            <group dispose={null}>
                <motionThree.mesh
                    rotation={[Math.PI / 2, 0, degreesToRadians(360)]}
                    scale={1}
                    variants={meshVariants}
                >
                    <boxGeometry args={[1, 1, 1]} />
                    <meshPhongMaterial color="#ff0" emissive="#e65c00" />
                </motionThree.mesh>
            </group>
        </MotionCanvas>
    )
}

const meshVariants = {
    unliked: {
        x: 0,
        transition: { duration: 0.5 },
    },
    liked: {
        x: 3.4,
        y: [0, -1.5, 0],
        opacity: 0,
        transition: { duration: 0.7 },
    },
    hover: {
        rotateZ: 0,
        scale: 1.4,
        transition: {
            rotateZ: { duration: 1.5, ease: "linear", repeat: Infinity },
        },
    },
}

const lights = [
    [0, 1, 5, 0.1],
    [0, 2, 0, 0.3],
    [5, 0, 1, 0.2],
    [-5, 0, 1, 0.2],
    [3, 0, 5, 0.6],
]

export const App = () => {
    const [isLiked, setIsLiked] = useState(false)

    return (
        <Container>
            <motion.button
                initial={false}
                animate={isLiked ? "liked" : "unliked"}
                whileHover="hover"
                whileTap="press"
                variants={buttonVariants}
                onClick={() => setIsLiked(!isLiked)}
                id="button"
            >
                <motion.div className="icon" variants={iconVariants}>
                    <React.Suspense fallback={null}>
                        <StarIcon />
                    </React.Suspense>
                    <motion.section
                        style={{
                            width: 100,
                            height: 100,
                            background: "pink",
                            display: "block",
                        }}
                        variants={meshVariants}
                    />
                </motion.div>
                <div className="label">
                    {/* <motion.span variants={labelTextVariants} class="default">
                        Star
                        <motion.span
                            variants={successTextVariants}
                            class="success"
                        >
                            red
                        </motion.span>
                    </motion.span> */}
                </div>
                <div className="number">
                    {/* <motion.span
                        variants={currentCountVariants}
                        class="current"
                    >
                        31
                    </motion.span>
                    <motion.span variants={newCountVariants} class="new">
                        32
                    </motion.span>
                    <div className="add">+1</div> */}
                </div>
            </motion.button>
        </Container>
    )
}

const Container = styled.div`
    button {
        --button-star-greyscale: 85%;
        --button-star-hue: 170deg;

        appearance: none;
        border: none;
        cursor: pointer;
        background-color: #1f2024;
        color: #fff;
        border-radius: 26px;
        outline: none;
        margin: 0;
        padding: 0;
        padding-left: 50px;
        font-family: "Poppins";
        font-size: 28px;
        font-weight: 600;
        line-height: 40px;
        position: relative;
        text-align: center;
        display: flex;
        align-items: center;
        box-shadow: inset 0 0 0 1px #35373f, 0px 1px 3px rgba(52, 54, 63, 0.1),
            0px 4px 10px rgba(52, 54, 63, 0.15);
    }

    .icon {
        display: block;
        width: 600px;
        height: 300px;
        z-index: 1;
        pointer-events: none;
        transform-origin: 50% 52%;
        filter: grayscale(var(--button-star-greyscale));
        opacity: 0.45;
        position: absolute;
        top: -110px;
        left: -250px;
        background: red;
    }

    .icon canvas {
        position: absolute;
        width: 100%;
        height: 100%;
    }

    .label {
        width: 180px;
        padding: 20px 0;
        transform: translateZ(0);
    }

    .default {
        display: block;
    }

    .number {
        padding: 20px 0;
        width: 88px;
        position: relative;
        transform: translateZ(0);
    }

    .number:before {
        content: "";
        position: absolute;
        left: 0;
        top: 1px;
        bottom: 1px;
        width: 1px;
        background-color: #35373f;
    }

    .current {
        color: #8a8d9b;
        opacity: 1;
        display: block;
    }

    .new {
        color: #fbfaaa;
        position: absolute;
        top: 20px;
        left: 0;
        right: 0;
        display: block;
    }

    .add {
        position: absolute;
        bottom: 100%;
        left: 0;
        right: 0;
        opacity: 0;
        transform: translateY(38px);
        pointer-events: none;
        color: #d0d0db;
        display: block;
    }

    html {
        box-sizing: border-box;
        -webkit-font-smoothing: antialiased;
    }

    * {
        box-sizing: inherit;
    }

    *:before,
    *:after {
        box-sizing: inherit;
    }

    /* devanagari */
    @font-face {
        font-family: "Poppins";
        font-style: normal;
        font-weight: 400;
        src: url(https://fonts.gstatic.com/s/poppins/v15/pxiEyp8kv8JHgFVrJJbecnFHGPezSQ.woff2)
            format("woff2");
        unicode-range: U+0900-097F, U+1CD0-1CF6, U+1CF8-1CF9, U+200C-200D,
            U+20A8, U+20B9, U+25CC, U+A830-A839, U+A8E0-A8FB;
    }
    /* latin-ext */
    @font-face {
        font-family: "Poppins";
        font-style: normal;
        font-weight: 400;
        src: url(https://fonts.gstatic.com/s/poppins/v15/pxiEyp8kv8JHgFVrJJnecnFHGPezSQ.woff2)
            format("woff2");
        unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB,
            U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
    }
    /* latin */
    @font-face {
        font-family: "Poppins";
        font-style: normal;
        font-weight: 400;
        src: url(https://fonts.gstatic.com/s/poppins/v15/pxiEyp8kv8JHgFVrJJfecnFHGPc.woff2)
            format("woff2");
        unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6,
            U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193,
            U+2212, U+2215, U+FEFF, U+FFFD;
    }
    /* devanagari */
    @font-face {
        font-family: "Poppins";
        font-style: normal;
        font-weight: 600;
        src: url(https://fonts.gstatic.com/s/poppins/v15/pxiByp8kv8JHgFVrLEj6Z11lFd2JQEl8qw.woff2)
            format("woff2");
        unicode-range: U+0900-097F, U+1CD0-1CF6, U+1CF8-1CF9, U+200C-200D,
            U+20A8, U+20B9, U+25CC, U+A830-A839, U+A8E0-A8FB;
    }
    /* latin-ext */
    @font-face {
        font-family: "Poppins";
        font-style: normal;
        font-weight: 600;
        src: url(https://fonts.gstatic.com/s/poppins/v15/pxiByp8kv8JHgFVrLEj6Z1JlFd2JQEl8qw.woff2)
            format("woff2");
        unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB,
            U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
    }
    /* latin */
    @font-face {
        font-family: "Poppins";
        font-style: normal;
        font-weight: 600;
        src: url(https://fonts.gstatic.com/s/poppins/v15/pxiByp8kv8JHgFVrLEj6Z1xlFd2JQEk.woff2)
            format("woff2");
        unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6,
            U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193,
            U+2212, U+2215, U+FEFF, U+FFFD;
    }
    /* devanagari */
    @font-face {
        font-family: "Poppins";
        font-style: normal;
        font-weight: 700;
        src: url(https://fonts.gstatic.com/s/poppins/v15/pxiByp8kv8JHgFVrLCz7Z11lFd2JQEl8qw.woff2)
            format("woff2");
        unicode-range: U+0900-097F, U+1CD0-1CF6, U+1CF8-1CF9, U+200C-200D,
            U+20A8, U+20B9, U+25CC, U+A830-A839, U+A8E0-A8FB;
    }
    /* latin-ext */
    @font-face {
        font-family: "Poppins";
        font-style: normal;
        font-weight: 700;
        src: url(https://fonts.gstatic.com/s/poppins/v15/pxiByp8kv8JHgFVrLCz7Z1JlFd2JQEl8qw.woff2)
            format("woff2");
        unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB,
            U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
    }
    /* latin */
    @font-face {
        font-family: "Poppins";
        font-style: normal;
        font-weight: 700;
        src: url(https://fonts.gstatic.com/s/poppins/v15/pxiByp8kv8JHgFVrLCz7Z1xlFd2JQEk.woff2)
            format("woff2");
        unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6,
            U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193,
            U+2212, U+2215, U+FEFF, U+FFFD;
    }
`

const buttonVariants: Variants = {
    hover: {
        "--button-star-greyscale": "0%",
    },
    press: { scale: 0.95 },
}

const iconVariants: Variants = {
    hover: { opacity: 1 },
}

const labelTextVariants: Variants = {
    unliked: { x: 24 },
    liked: { x: 0 },
}

const successTextVariants: Variants = {
    unliked: { opacity: 0 },
    liked: { opacity: 1 },
}

const likedTransition: Transition = {
    duration: 0.25,
    delay: 0.5,
}

const currentCountVariants: Variants = {
    unliked: { opacity: 1, y: 0, transition: { duration: 0.25 } },
    liked: { opacity: 0, y: -40, transition: likedTransition },
}

const newCountVariants: Variants = {
    unliked: { opacity: 0, y: 40, transition: { duration: 0.25 } },
    liked: { opacity: 1, y: 0, transition: likedTransition },
}
