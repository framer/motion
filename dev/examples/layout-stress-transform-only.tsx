import { motion, MotionConfig } from "framer-motion"
import * as React from "react"
import { useState } from "react"
import styled from "styled-components"

/**
 * This stress test is designed to dirty transform at the top of the tree,
 * but only update layout at the leaves.
 */

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
        width: 100px;
        height: 200px;
        display: flex;
    }

    .b {
        background-color: hsla(20, 50%, 50%);
        width: 100px;
        height: 200px;
        position: absolute;
        top: 0px;
        left: 0px;
    }

    .c {
        background-color: hsla(60, 50%, 50%);
        width: 100px;
        height: 200px;
    }

    .d {
        background-color: hsla(90, 50%, 50%);
        width: 100px;
        height: 200px;

        .i {
            width: var(--width);
            height: var(--height);
            top: var(--offset);
            left: var(--offset);
        }
    }

    .e {
        background-color: hsla(120, 50%, 50%);
        width: 100px;
        height: 200px;
        position: absolute;
        top: 0px;
        left: 0px;
    }

    .f {
        background-color: hsla(170, 50%, 50%);
        width: 100px;
        height: 200px;
        position: absolute;
        top: 0px;
        left: 0px;
    }

    .g {
        background-color: hsla(220, 50%, 50%);
        width: 100px;
        height: 200px;
        position: absolute;
        top: 0px;
        left: 0px;
    }

    .h {
        background-color: hsla(260, 50%, 50%);
        width: 100px;
        height: 200px;
        position: absolute;
        top: 0px;
        left: 0px;
    }

    .i {
        background-color: hsla(300, 50%, 50%);
        width: 100px;
        height: 200px;
        position: absolute;
        top: 0px;
        left: 0px;
    }
`

function Group({
    children,
    expanded,
}: React.PropsWithChildren<{ expanded?: boolean }>) {
    return (
        <motion.div layout className="a" animate={{ x: expanded ? 100 : 0 }}>
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
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
                <Group expanded={expanded}>
                    <Group />
                </Group>
            </Container>
        </MotionConfig>
    )
}
