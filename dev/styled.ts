import styled from "styled-components"

export const Container = styled.div`
    min-width: 100vw;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;

    --black: #000000;
    --ash-black: #222;
    --white: #fafafa;
    --sky: #00ccff;
    --green: #22dddd;
    --blue: #1300ff;
    --dusk: #6600ff;
    --purple: #9900ff;
    --pink: #ff0066;
    --red: #fe0222;
    --orange: #fd7702;
    --yellow: #ffbb00;
`

export const Box = styled.div`
    width: 100px;
    height: 100px;
    background: #1300ff;
`

export const Code = styled.span`
    font-family: "Menlo";
    font-size: 90%;
    color: grey;
`
