import * as React from "react"
import { motion, usePose, useMotionValue } from "@framer"
import { Box } from "../styled"
import { useInterval } from "../inc/use-interval"
import styled from "styled-components"

const Scrollable = styled.div`
    display: flex;
    overflow-x: scroll;
    background: rgba(0, 0, 0, 0);
`

const MotionScrollable = motion(Scrollable)({
    default: { scrollX: 0 },
    test: { scrollX: 200 },
})

const Box = styled.div`
    width: 100px;
    height: 100px;
    margin-right: 100px;
    background: white;
    flex: 0 0 100px;
`

export const App = () => {
    const scrollX = useMotionValue(0)
    const [is, setIs] = React.useState(false)
    setTimeout(() => setIs(!is), 2000)
    return (
        <MotionScrollable pose={is ? "test" : "default"} motionValues={{ scrollX }}>
            <Box />
            <Box />
            <Box />
            <Box />
            <Box />
            <Box />
            <Box />
            <Box />
            <Box />
            <Box />
            <Box />
            <Box />
            <Box />
            <Box />
            <Box />
        </MotionScrollable>
    )
}
