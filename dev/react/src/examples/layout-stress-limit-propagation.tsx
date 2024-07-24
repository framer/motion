import { motion, MotionConfig } from "framer-motion"
import * as React from "react"
import { useState } from "react"
import styled from "styled-components"

const Container = styled(motion.div)`
    --width: 200px;
    --height: 200px;
    --offset: 0px;
    width: 1000px;
    height: 4000px;
    overflow: hidden;
    position: fixed;
    top: 0;
    left: 0;
    &.expanded {
        width: 500px;
        --offset: 100px;
    }
    .a {
        background-color: hsla(0, 50%, 50%);
        position: relative;
        width: var(--width);
        height: var(--height);
        display: flex;
        .a {
            width: 200px;
            height: 200px;
        }
    }
    .b {
        background-color: hsla(20, 50%, 50%);
        width: 100px;
        height: 100px;
        position: absolute;
        top: 0px;
        left: 0px;
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
        top: 0px;
        left: 0px;
    }
    .f {
        background-color: hsla(170, 50%, 50%);
        width: 100px;
        height: 100px;
        position: absolute;
        top: 0px;
        left: 0px;
    }
    .g {
        background-color: hsla(220, 50%, 50%);
        width: 100px;
        height: 100px;
        position: absolute;
        top: 0px;
        left: 0px;
    }
    .h {
        background-color: hsla(260, 50%, 50%);
        width: 100px;
        height: 100px;
        position: absolute;
        top: 0px;
        left: 0px;
    }
    .i {
        background-color: hsla(300, 50%, 50%);
        width: 100px;
        height: 100px;
        position: absolute;
        top: 0px;
        left: 0px;
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
                    <motion.div layout className="i">
                        {children}
                    </motion.div>
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
                layout
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
