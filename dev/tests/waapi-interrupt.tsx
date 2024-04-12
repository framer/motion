import { motion, animate } from "framer-motion"
import { useEffect, useState } from "react"
import styled from "styled-components"

const Container = styled.section`
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 100px;

    #box {
        width: 100px;
        height: 100px;
        position: relative;
        top: 100px;
        left: 100px;
        background-color: red;
        opacity: 1;
    }
`

export const App = () => {
    const [state, setState] = useState(false)

    return (
        <Container>
            <motion.div
                id="box"
                transition={{ duration: 1 }}
                initial={{ transform: "scale(1)", opacity: 1 }}
                animate={{
                    transform: `scale(${state ? 1 : 2})`,
                    opacity: state ? 1 : 0,
                }}
                onClick={() => setState(!state)}
            >
                Content
            </motion.div>
        </Container>
    )
}
