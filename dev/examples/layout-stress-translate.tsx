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
        --offset: 100px;
    }

    .a {
        background-color: hsla(0, 50%, 50%);
        position: relative;
        width: var(--width);
        height: var(--height);
        display: flex;
    }

    .b {
        background-color: hsla(20, 50%, 50%);
        width: var(--width);
        height: var(--height);
        position: absolute;
        top: var(--offset);
        left: var(--offset);
    }

    .c {
        background-color: hsla(60, 50%, 50%);
        width: var(--width);
        height: var(--height);
    }

    .d {
        background-color: hsla(90, 50%, 50%);
        width: var(--width);
        height: var(--height);
    }

    .e {
        background-color: hsla(120, 50%, 50%);
        width: var(--width);
        height: var(--height);
        position: absolute;
        top: var(--offset);
        left: var(--offset);
    }

    .f {
        background-color: hsla(170, 50%, 50%);
        width: var(--width);
        height: var(--height);
        position: absolute;
        top: var(--offset);
        left: var(--offset);
    }

    .g {
        background-color: hsla(220, 50%, 50%);
        width: var(--width);
        height: var(--height);
        position: absolute;
        top: var(--offset);
        left: var(--offset);
    }

    .h {
        background-color: hsla(260, 50%, 50%);
        width: var(--width);
        height: var(--height);
        position: absolute;
        top: var(--offset);
        left: var(--offset);
    }

    .i {
        background-color: hsla(300, 50%, 50%);
        width: var(--width);
        height: var(--height);
        position: absolute;
        top: var(--offset);
        left: var(--offset);
    }
`

function Group({ children }: React.PropsWithChildren) {
    return (
        <motion.div layout className="a">
            <motion.div layout className="b"></motion.div>
            <motion.div layout className="c"></motion.div>
            <motion.div layout className="d">
                {children}
            </motion.div>
            <motion.div layout className="e"></motion.div>
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
