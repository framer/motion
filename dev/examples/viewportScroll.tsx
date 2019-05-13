import * as React from "react"
import { Fragment } from "react"
import styled from "styled-components"
import { useViewportScroll, useTransform } from "@framer"
import { motion } from "../../src"

const Container = styled.div`
    margin: 100px auto;
    max-width: 600px;
    padding: 30px;
    background-color: white;
    color: #333;
`

const containerStyle: React.CSSProperties = {
    position: "fixed",
    top: 50,
    left: 0,
    right: 0,
    height: 30,
    zIndex: 0,
}

const progressStyle = {
    height: 30,
    width: "100%",
    background: "white",
    transformOrigin: "0 0",
}

export const App = () => {
    const { scrollYProgress } = useViewportScroll()

    scrollYProgress.onChange(console.log)

    return (
        <div className="app">
            <motion.div
                style={{
                    width: "100%",
                    height: 20,
                    background: "red",
                    scaleX: scrollYProgress,
                    originX: 0,
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                }}
            />
            <article>
                <p>
                    Photos taken by{" "}
                    <a href="https://mattperry.photography">Matt Perry</a>
                </p>
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Aliquam at eros eu orci condimentum fermentum. Nam vehicula
                    nunc et nisi pretium, sit amet commodo erat dapibus.
                </p>
                <p>
                    Cras eu orci mollis, varius erat at, volutpat dolor. Proin a
                    tortor vel tellus sodales vehicula a at dui. Nam interdum
                    condimentum dolor, quis gravida dolor dapibus ac. Aliquam
                    metus est, sagittis eget convallis eget, ornare a lorem.
                </p>
                <img
                    style={{ width: 600, height: 400 }}
                    alt="London nightbus"
                    src="https://static1.squarespace.com/static/5b475b2c50a54f54f9b4e1dc/5b4a5c2d88251b376ea105c1/5b4a5c4703ce643303f960e7/1531599999503/DSCF2776.jpg?format=1000w"
                />
                <p>
                    Fusce sit amet augue nec libero vestibulum fermentum vel in
                    nunc. Cras vulputate at felis nec venenatis. Pellentesque
                    sollicitudin id nisl ac tristique. Nam pellentesque, quam eu
                    egestas ultricies, tellus odio iaculis felis, ut maximus
                    ipsum ligula at purus.
                </p>
                <p>
                    Nam scelerisque eget augue sed molestie. Nam et ullamcorper
                    mauris, ac bibendum sem. Aliquam massa ante, aliquam eget
                    velit a, sagittis fringilla magna. Suspendisse felis lacus,
                    mattis in magna ut, porta scelerisque lacus. Nunc eget
                    ultricies libero, eu cursus dui.
                </p>
                <p>
                    Vivamus ac leo accumsan, tempor tortor quis, rutrum magna.
                    Aliquam in nibh ex. Morbi et nibh erat. Nulla at eros vitae
                    purus varius egestas.
                </p>
                <p>
                    Vestibulum placerat porttitor posuere. Mauris auctor
                    tristique neque, vel blandit ipsum mattis id. Morbi in ipsum
                    et dui vehicula pellentesque.
                </p>
                <img
                    style={{ width: 600, height: 400 }}
                    alt="London skyline"
                    src="https://static1.squarespace.com/static/5b475b2c50a54f54f9b4e1dc/5b4a5c2d88251b376ea105c1/5b4ae06b70a6ad5e776f7bcb/1531635294876/DSCF2803.jpg?format=1000w"
                />
                <p>
                    Phasellus convallis ligula sit amet pulvinar sollicitudin.
                    Ut luctus vitae quam in suscipit. Donec auctor feugiat
                    accumsan. Phasellus mollis feugiat tincidunt. Cras
                    ullamcorper metus et commodo lobortis.
                </p>
                <p>
                    Etiam erat nulla, maximus vitae hendrerit at, accumsan vitae
                    augue. Sed sit amet diam sit amet dui ullamcorper mattis
                    quis et urna. Ut lectus eros, consequat at rhoncus et,
                    ultricies at nunc.
                </p>
                <p>
                    Ut ut urna ligula. Fusce lacinia efficitur enim id ultrices.
                    Mauris sagittis orci et sapien feugiat, eget tincidunt
                    lectus tristique. Cras leo augue, blandit sed ipsum
                    convallis, ultricies dictum felis.
                </p>
                <p>
                    Aliquam lobortis tempus lectus, at tincidunt tellus
                    hendrerit ut. Ut pharetra, nisl vitae pretium lobortis, ante
                    nisl pellentesque felis, at lobortis felis nunc vitae
                    libero.
                </p>
            </article>
        </div>
    )
}
