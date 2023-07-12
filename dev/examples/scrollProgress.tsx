import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, animate, scrollProgress, useMotionValue } from "framer-motion"

function block() {
    const start = performance.now()
    while (performance.now() - start < 2000) {}
}

export const Example = () => {
    const ref = useRef(null)

    useEffect(() => {
        // scrollProgress(
        // animate(ref.current, { transform: ["scaleX(0)", "scaleX(1)"] })
        // ),
        // window.testAnimation = document.createElement("div").animate(
        //     { opacity: [0, 1] },
        //     {
        //         timeline: new ScrollTimeline(),
        //         rangeStart: "50%",
        //     }
        // )
        // console.log(window.testAnimation)
        // animate(
        //     "#box",
        //     { rotate: 360 },
        //     { repeat: Infinity, ease: "linear", duration: 5 }
        // )
    }, [])

    return (
        <>
            <div ref={ref} className="progress-bar" />
            <button onClick={block}>Block main thread</button>
            <h1>
                <code>scroll()</code> demo
            </h1>
            <LoremIpsum />
        </>
    )
}

export const App = () => {
    return (
        <>
            <style>{`body {
  --black: #111111;
  --white: #fdfdfd;
  --green: #22cc88;
  --blue: #0055ff;
  --purple: #8855ff;
  --red: #ff0055;
  --orange: #ee4444;
  --yellow: #ffcc00;
  --mustard: #ffaa00;

  --background: var(--white);
  --accent: var(--black);

  margin: 0;
  padding: 0;
  background-color: var(--background)!important;
  color: var(--accent);
  padding-bottom: 100px;
}

* {
  font-family: sofia-pro, sans-serif;
  font-weight: 400;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
}

button { 
  position: fixed;
  top: 20px;
  left: 20px;
  -webkit-appearance: button;
  background: var(--accent);
  color: var(--background);
  border: none;
  padding: 15px 25px;
  border-radius: 50px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 50px;
  z-index: 2;
}

h1,
h2,
h3 {
  font-family: sofia-pro, sans-serif;
  font-weight: 600;
  font-style: normal;
}

h1 {
  font-size: 36px;
  font-weight: 700;
  letter-spacing: -1px;
  line-height: 1.2;
  text-align: center;
  margin: 100px 0 40px;
}

h2 {
  font-weight: 400;
  margin: 50px 0 10px;
}

p {
  margin: 0 0 30px 0;
  font-size: 18px;
}

footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 20px;
  background-image: radial-gradient(
    rgba(0, 0, 0, 0) 1px,
    var(--background) 1px
  );
  background-size: 4px 4px;
  backdrop-filter: blur(3px);
  font-size: 14px;
  line-height: 14px;
}

footer::before {
  display: block;
  content: "";
  position: absolute;
  top: -1px;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--accent);
  opacity: 0.2;
}

footer svg {
  margin-right: 20px;
}

footer a {
  text-decoration: none;
  color: var(--accent);
}

code {
  font-family: input-mono, monospace;
  font-weight: 400;
  font-style: normal;
}

article {
  max-width: 500px;
  padding: 20px;
  margin: 0 auto;
}

.progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 20px;
  background: var(--red);
  transform-origin: 0%;
}

#box {
  width: 200px;
  height: 200px;
  background: var(--blue);
}
`}</style>
            <div className="example-container">
                <Example />
            </div>
        </>
    )
}

export function LoremIpsum() {
    return (
        <>
            <article>
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Aliquam ac rhoncus quam.
                </p>
                <p>
                    Fringilla quam urna. Cras turpis elit, euismod eget ligula
                    quis, imperdiet sagittis justo. In viverra fermentum ex ac
                    vestibulum. Aliquam eleifend nunc a luctus porta. Mauris
                    laoreet augue ut felis blandit, at iaculis odio ultrices.
                    Nulla facilisi. Vestibulum cursus ipsum tellus, eu tincidunt
                    neque tincidunt a.
                </p>
                <div id="box"></div>
                <h2>Sub-header</h2>
                <p>
                    In eget sodales arcu, consectetur efficitur metus. Duis
                    efficitur tincidunt odio, sit amet laoreet massa fringilla
                    eu.
                </p>
                <p>
                    Pellentesque id lacus pulvinar elit pulvinar pretium ac non
                    urna. Mauris id mauris vel arcu commodo venenatis. Aliquam
                    eu risus arcu. Proin sit amet lacus mollis, semper massa ut,
                    rutrum mi.
                </p>
                <p>
                    Sed sem nisi, luctus consequat ligula in, congue sodales
                    nisl.
                </p>
                <p>
                    Vestibulum bibendum at erat sit amet pulvinar. Pellentesque
                    pharetra leo vitae tristique rutrum. Donec ut volutpat ante,
                    ut suscipit leo.
                </p>
                <h2>Sub-header</h2>
                <p>
                    Maecenas quis elementum nulla, in lacinia nisl. Ut rutrum
                    fringilla aliquet. Pellentesque auctor vehicula malesuada.
                    Aliquam id feugiat sem, sit amet tempor nulla. Quisque
                    fermentum felis faucibus, vehicula metus ac, interdum nibh.
                    Curabitur vitae convallis ligula. Integer ac enim vel felis
                    pharetra laoreet. Interdum et malesuada fames ac ante ipsum
                    primis in faucibus. Pellentesque hendrerit ac augue quis
                    pretium.
                </p>
                <p>
                    Morbi ut scelerisque nibh. Integer auctor, massa non dictum
                    tristique, elit metus efficitur elit, ac pretium sapien nisl
                    nec ante. In et ex ultricies, mollis mi in, euismod dolor.
                </p>
                <p>Quisque convallis ligula non magna efficitur tincidunt.</p>
                <p>
                    Pellentesque id lacus pulvinar elit pulvinar pretium ac non
                    urna. Mauris id mauris vel arcu commodo venenatis. Aliquam
                    eu risus arcu. Proin sit amet lacus mollis, semper massa ut,
                    rutrum mi.
                </p>
                <p>
                    Sed sem nisi, luctus consequat ligula in, congue sodales
                    nisl.
                </p>
                <p>
                    Vestibulum bibendum at erat sit amet pulvinar. Pellentesque
                    pharetra leo vitae tristique rutrum. Donec ut volutpat ante,
                    ut suscipit leo.
                </p>
                <h2>Sub-header</h2>
                <p>
                    Maecenas quis elementum nulla, in lacinia nisl. Ut rutrum
                    fringilla aliquet. Pellentesque auctor vehicula malesuada.
                    Aliquam id feugiat sem, sit amet tempor nulla. Quisque
                    fermentum felis faucibus, vehicula metus ac, interdum nibh.
                    Curabitur vitae convallis ligula. Integer ac enim vel felis
                    pharetra laoreet. Interdum et malesuada fames ac ante ipsum
                    primis in faucibus. Pellentesque hendrerit ac augue quis
                    pretium.
                </p>
                <p>
                    Morbi ut scelerisque nibh. Integer auctor, massa non dictum
                    tristique, elit metus efficitur elit, ac pretium sapien nisl
                    nec ante. In et ex ultricies, mollis mi in, euismod dolor.
                </p>
                <p>Quisque convallis ligula non magna efficitur tincidunt.</p>
            </article>
        </>
    )
}
