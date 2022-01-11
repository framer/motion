import * as React from "react"
import { useState, useRef } from "react"
import { motion } from "framer-motion"
import styled from "styled-components"

/**
 * This is an example of transferring drag status by tagging a component with layoutId
 */

const Container = styled.div`
    width: 100vw;
    height: 100vh;
    position: absolute;
    display: flex;
    align-items: stretch;
    justify-content: stretch;
`

const Zone = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50%;
    height: 100%;
`

const Shadow = styled(motion.div)`
    background: rgba(255, 255, 255, 0.5);
    width: 100px;
    height: 100px;
    border-radius: 20px;
`

const Draggable = styled(motion.div)`
    background: white;
    width: 100px;
    height: 100px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
`

const Dot = styled(motion.div)`
    background: rgb(255, 0, 136);
    width: 20px;
    height: 20px;
    border-radius: 10px;
`

function Target({ onProjectionUpdate }) {
    return (
        <Shadow>
            <Draggable
                drag
                dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
                dragElastic={1}
                onProjectionUpdate={onProjectionUpdate}
                layoutId="a"
            >
                <Dot layoutId="dot" />
            </Draggable>
        </Shadow>
    )
}

function DragDrop() {
    const viewportWidth = useRef(0)
    const [is, setIs] = useState(true)

    React.useEffect(() => {
        viewportWidth.current = window.innerWidth
    }, [])

    return (
        <>
            <Zone>
                {is && (
                    <Target
                        onProjectionUpdate={(box) => {
                            if (box.x.min > viewportWidth.current / 2 + 100) {
                                setIs(false)
                            }
                        }}
                    />
                )}
            </Zone>
            <Zone>
                {!is && (
                    <Target
                        onProjectionUpdate={(box) => {
                            if (box.x.min < viewportWidth.current / 2 - 100) {
                                setIs(true)
                            }
                        }}
                    />
                )}
            </Zone>
        </>
    )
}

export const App = () => {
    return (
        <Container>
            <DragDrop />
        </Container>
    )
}
