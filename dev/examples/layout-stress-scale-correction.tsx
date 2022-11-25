import { motion, MotionConfig } from "framer-motion"
import * as React from "react"
import { useState } from "react"
import styled from "styled-components"

const Container = styled.div`
    display: flex;
    flex-wrap: wrap;
    --width: 200px;
    --height: 200px;
    --offset: 0px;
    width: 1000px;
    height: 4000px;
    overflow: hidden;
    justify-content: flex-start;
    align-items: flex-start;

    &.expanded {
        --width: 500px;
        --height: 500px;
        --offset: 100px;
    }

    .a {
        width: var(--width);
        height: var(--height);
        background-color: hsla(0, 50%, 50%);
        position: relative;
        display: flex;

        .a {
            width: 100px;
            height: 100px;
        }
    }

    .b {
        background-color: hsla(20, 50%, 50%);
        width: 100px;
        height: 100px;
        position: absolute;
    }

    .c {
        background-color: hsla(60, 50%, 50%);
        width: 100px;
        height: 100px;
    }

    .d {
        background-color: hsla(90, 50%, 50%);
        width: 100px;
        height: 100px;
    }

    .e {
        background-color: hsla(120, 50%, 50%);
        width: 100px;
        height: 100px;
        position: absolute;
        top: 100px;
        left: 100px;
    }

    .f {
        background-color: hsla(170, 50%, 50%);
        width: 100px;
        height: 100px;
        position: absolute;
    }

    .g {
        background-color: hsla(220, 50%, 50%);
        width: 100px;
        height: 100px;
        position: absolute;
    }

    .h {
        background-color: hsla(260, 50%, 50%);
        position: absolute;
    }

    .i {
        background-color: hsla(300, 50%, 50%);
        width: 100px;
        height: 100px;
        position: absolute;
        top: var(--offset);
        left: var(--offset);
    }
`

function Group({ children }: React.PropsWithChildren) {
    return (
        <motion.div layout className="a">
            <motion.div layout className="d">
                <motion.div layout className="b"></motion.div>
                <motion.div layout className="c"></motion.div>
                {children}
            </motion.div>
            <motion.div layout className="f">
                <motion.div layout className="g"></motion.div>
                <motion.div layout className="h">
                    <motion.div layout className="i"></motion.div>
                </motion.div>
            </motion.div>
        </motion.div>
    )
}

export const App = () => {
    const [expanded, setExpanded] = useState(false)

    return (
        <MotionConfig transition={{ duration: 2 }}>
            <Container
                data-layout
                className={expanded ? "expanded" : ""}
                onClick={() => {
                    setExpanded(!expanded)
                }}
            >
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
                <Group>
                    <Group />
                </Group>
            </Container>
        </MotionConfig>
    )
}
