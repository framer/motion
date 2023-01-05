import * as React from "react"
import { motion } from "framer-motion"
import styled from "styled-components"

const Container = styled.div`
    .avatar-wrapper {
        position: relative;
        margin: auto;
        align-self: center;
        justify-self: center;
        width: 120px;
        height: 120px;
    }

    .avatar {
        width: 120px;
        height: 120px;
        will-change: opacity;
        opacity: 0.8;
        filter: drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.16));
    }

    .container {
        width: 375px;
        height: 812px;
        border-radius: 16px;
        background: linear-gradient(180deg, #35a1ea 0%, #2c8dcd 100%);
        display: flex;
        justify-content: center;
        align-content: center;
        flex-flow: column;
    }

    .circle {
        opacity: 0;
        position: absolute;
        height: 120px;
        width: 120px;
        border: 2px solid #fff;
        border-radius: 120px;
        top: 0;
        left: 0;
    }

    .status {
        align-self: flex-start;
        margin-bottom: auto;
        margin: 0;
    }
`

export const App = () => {
    return (
        <Container>
            <div className="container">
                <div className="avatar-wrapper">
                    <motion.img
                        alt="avatar"
                        animate={{
                            scale: [1, 0.98, 1, 1, 1, 1],
                            y: [0, -20, 0, -2, 0, 0],
                            opacity: [0.2, 1, 0.2, 0.2, 0.2, 0.2],
                        }}
                        transition={{
                            duration: 2.5,
                            type: "spring",
                            bounce: 1,
                            // times: [0, 0.1, 0.15, 0.18, 0.2, 1],
                            repeat: Infinity,
                            // repeatType: "Loop",
                        }}
                        // variants={animationFirstAvatar}
                        className="avatar"
                        src="https://media.discordapp.net/attachments/494558054373916691/1034640981057880104/unknown.png"
                    />
                    <motion.div className="circle"></motion.div>
                </div>
            </div>
        </Container>
    )
}
