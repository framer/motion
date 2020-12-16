import React from "react"
import { motion } from "@framer"
import styled from "styled-components"

const Container = styled.div`
    .App {
        font-family: sans-serif;
        text-align: center;
    }

    [data-stack="true"] {
        display: flex;
        --stack-gap-x: 0px;
        --stack-gap-y: 0px;
    }
    [data-stack="true"] > * {
        position: relative !important;
        margin: calc(var(--stack-gap-y, 0) / 2) calc(var(--stack-gap-x, 0) / 2);
    }
    [data-stack="true"] > *:first-child {
        margin-top: 0px;
        margin-left: 0px;
    }
    [data-stack="true"] > *:last-child {
        margin-bottom: 0px;
        margin-right: 0px;
    }
    [data-border="true"]::after {
        content: "";
        border-width: var(--border-width, 0);
        border-color: var(--border-color, none);
        border-style: var(--border-style, none);
        width: 100%;
        height: 100%;
        position: absolute;
        box-sizing: border-box;
        left: 0;
        top: 0;
    }
    .framer-VxtkR5lbx {
        position: absolute;
        width: 100%;
        height: 100%;
    }
    .framer-uNDAbBSoQ {
        position: absolute;
        width: 43px;
        bottom: 21px;
        left: 27px;
        top: 23px;
    }
    .framer-WAfROag8u {
        position: absolute;
        width: 35px;
        right: 21px;
        bottom: 21px;
        top: 23px;
    }
    .framer-v-ceHYlSTfo .framer-VxtkR5lbx {
        cursor: pointer;
    }
    .framer-v-ceHYlSTfo .framer-uNDAbBSoQ {
        width: 43px;
        height: auto;
        right: auto;
        bottom: 22px;
        left: 44px;
        top: 22px;
    }
    .framer-v-VxtkR5lbx.hover .framer-WAfROag8u {
        width: 35px;
        height: auto;
        right: 49px;
        bottom: 21px;
        left: auto;
        top: 23px;
    }
`

export function App() {
    const variant = "VxtkR5lbx"
    const [topLevelVariant, setTopLevelVariant] = React.useState(() => variant)

    return (
        <Container>
            <h1>Hello CodeSandbox</h1>
            <h2>Start editing to see some magic happen!</h2>
            <motion.div
                initial={variant}
                animate={topLevelVariant}
                style={{
                    overflow: "visible",
                    backgroundColor: "hsla(204, 60%, 58%, 0.5)",
                    rotate: 0,
                    width: 200,
                    height: 200,
                }}
                variants={{
                    ceHYlSTfo: {
                        opacity: 0.35,
                        backgroundColor: "hsla(204, 61%, 41%, 0.5)",
                    },
                    "VxtkR5lbx-hover": {
                        backgroundColor: "hsla(204, 60%, 52%, 0.5)",
                    },
                }}
                onTap={() =>
                    setTopLevelVariant(
                        topLevelVariant === "ceHYlSTfo" ? variant : "ceHYlSTfo"
                    )
                }
            ></motion.div>
        </Container>
    )
}

// import * as React from "react"
// import { motion } from "@framer"

// /**
//  * An example of orchestrating animations through children using variants.
//  */

// // Styles
// const modalStyle = {
//     background: "white",
//     width: 320,
//     height: "auto",
//     padding: "20px 20px 0 20px",
// }
// const itemStyle = { width: "100%", marginBottom: 20, display: "flex" }
// const contentStyle = { background: "#333", borderRadius: 5 }
// const iconStyle = {
//     ...contentStyle,
//     flex: "0 0 100px",
//     width: 100,
//     height: 100,
//     marginRight: 20,
// }
// const blurbStyle = { ...contentStyle, width: 200, height: 40, marginTop: 10 }
// const smallBlurbStyle = { ...blurbStyle, width: 150, height: 20 }

// // Animation variants
// const itemVariants = {
//     closed: { opacity: 0, x: -30 },
//     open: {
//         opacity: 1,
//         x: 0,
//         transition: { staggerChildren: 0.5 },
//     },
// }

// const modalVariants = {
//     closed: { opacity: 0, y: 100 },
//     open: {
//         opacity: 1,
//         y: 0,
//         transition: {
//             staggerChildren: 0.5,
//             delayChildren: 0.5,
//             duration: 0.3,
//         },
//     },
// }

// // Components
// const Item = () => {
//     return (
//         <motion.div variants={itemVariants} style={itemStyle}>
//             <div style={iconStyle} />
//             <div>
//                 <motion.div variants={itemVariants} style={blurbStyle} />
//                 <motion.div variants={itemVariants} style={smallBlurbStyle} />
//             </div>
//         </motion.div>
//     )
// }

// export const App = () => {
//     return (
//         <motion.div
//             animate="open"
//             initial="closed"
//             variants={modalVariants}
//             style={modalStyle}
//         >
//             <Item />
//             <Item />
//             <Item />
//             <Item />
//         </motion.div>
//     )
// }
