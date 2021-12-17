import * as React from "react"
import { useState } from "react"
import { motion, LayoutSVG } from "@framer"
import styled from "styled-components"

export const App = () => {
    const [isFullscreen, setFullscreen] = useState(false)

    return (
        <Container
            isFullscreen={isFullscreen}
            onClick={() => setFullscreen(!isFullscreen)}
        >
            <LayoutSVG transition={{ duration: 2 }}>
                <Illustration />
            </LayoutSVG>
        </Container>
    )
}

const Container = styled("div")`
    ${({ isFullscreen }) =>
        isFullscreen
            ? `
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`
            : `
  width: 100px;
  height: 100px;
`}

    svg {
        width: 100%;
        height: 100%;
    }
`

function Illustration() {
    return (
        <>
            <g transform="translate(0 2)">
                <path
                    d="M 0 0 L 1280 0 L 1280 800 L 0 800 Z"
                    fill="rgb(0,1,25)"
                ></path>
                <path
                    d="M 800 0 L 1280 0 L 1280 800 L 800 800 Z"
                    fill="rgb(152,232,255)"
                ></path>
                <path
                    d="M 421.1 495.63 L 592.8 643 C 650.749 692.802 724.661 720.128 801.07 720 C 919.52 720 1022.93 655.65 1078.26 560 L 1078.26 800 L 1.07 800 L 0 432.38 C 140.902 371.122 304.411 395.681 421.1 495.63 Z"
                    fill="rgb(255,198,168)"
                ></path>
                <path
                    d="M 1214.94 446.14 L 1130 461.65 C 1087.964 469.323 1044.691 457.947 1011.863 430.594 C 979.035 403.241 960.038 362.73 960 320 L 960 240 C 960 151.634 888.366 80 800 80 C 711.634 80 640 151.634 640 240 C 640 328.366 711.634 400 800 400 L 880 400 C 920.745 400.016 958.7 420.697 980.803 454.926 C 1002.906 489.154 1006.139 532.257 989.39 569.4 L 952.07 651.91 C 931.046 698.446 920.205 748.935 920.27 800 L 1280 800 L 1280 440.27 C 1258.181 440.263 1236.406 442.228 1214.94 446.14 Z M 800 320 C 755.817 320 720 284.183 720 240 C 720 195.817 755.817 160 800 160 C 844.183 160 880 195.817 880 240 C 880 284.183 844.183 320 800 320 Z"
                    fill="rgb(255,255,255)"
                ></path>
                <path
                    d="M 320 800 L 320 0 M 278.49 800 L 278.49 0 M 400 800 L 400 0 M 360 800 L 360 0 M 442.1 800 L 442.1 0 M 480 800 L 480 0"
                    fill="transparent"
                    strokeWidth="3"
                    stroke="rgb(231,255,247)"
                    strokeMiterlimit="10"
                    strokeDasharray=""
                ></path>
                <path
                    d="M 1040 320 C 1040 275.817 1075.817 240 1120 240 C 1164.183 240 1200 275.817 1200 320 C 1200 364.183 1164.183 400 1120 400 C 1075.817 400 1040 364.183 1040 320 Z"
                    fill="rgb(0,85,255)"
                ></path>
                <path
                    d="M 0 0 L 0 160.39 C 64.321 160.396 122.386 198.918 147.396 258.177 C 172.406 317.437 159.498 385.912 114.63 432 L 240 432 L 240 0 Z"
                    fill="rgb(0,85,255)"
                ></path>
                <g>
                    <defs>
                        <linearGradient
                            id="idBoZLhiBrsg-1484136991"
                            gradientTransform="rotate(180, 0.5, 0.5)"
                        >
                            <stop
                                offset="0"
                                stopColor="rgb(152,232,255)"
                                stopOpacity="1"
                            ></stop>
                            <stop
                                offset="1"
                                stopColor="rgb(231,255,247)"
                                stopOpacity="1"
                            ></stop>
                        </linearGradient>
                    </defs>
                    <path
                        d="M 159.1 399.1 C 104.379 399.031 50.227 410.202 0 431.92 L 0 800 L 240 800 L 240 407.28 C 213.379 401.828 186.274 399.087 159.1 399.1 Z"
                        fill="url(#idBoZLhiBrsg-1484136991)"
                    ></path>
                </g>
            </g>
        </>
    )
}
