import styled from "styled-components"

export const Container = styled.div`
    min-width: 100vw;
    min-height: 100vh;
    background: linear-gradient(0deg, rgb(119, 0, 255), rgba(119, 0, 255, 0)),
        linear-gradient(90deg, rgb(255, 0, 136), rgb(0, 153, 255));
    display: flex;
    align-items: center;
    justify-content: center;
`

export const Box = styled.div`
    width: 100px;
    height: 100px;
    background: #fff;
`

export const Code = styled.span`
    font-family: "Menlo";
    font-size: 90%;
    color: grey;
`
