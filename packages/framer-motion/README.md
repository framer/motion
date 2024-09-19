<p align="center">
  <img width="100" height="100" alt="Motion One logo" src="https://user-images.githubusercontent.com/7850794/164965523-3eced4c4-6020-467e-acde-f11b7900ad62.png" alt="Motion One Icon" />
</p>
<h1 align="center">Motion One for React</h1>

<br>

<p align="center">
  <a href="https://www.npmjs.com/package/framer-motion" target="_blank">
    <img src="https://img.shields.io/npm/v/framer-motion.svg?style=flat-square" />
  </a>
  <a href="https://www.npmjs.com/package/framer-motion" target="_blank">
  <img src="https://img.shields.io/npm/dm/framer-motion.svg?style=flat-square" />
  </a>
  <a href="https://twitter.com/motiondotdev" target="_blank">
  <img src="https://img.shields.io/twitter/follow/framer.svg?style=social&label=Follow"  />
  </a>
  <a href="https://discord.gg/DfkSpYe" target="_blank">
  <img src="https://img.shields.io/discord/308323056592486420.svg?logo=discord&logoColor=white" alt="Chat on Discord">
  </a>
</p>

<br>
<hr>
<br>

Motion One for React is an open source, production-ready library that’s designed for all creative developers.

It's the only animation library with a hybrid engine, combining the power of JavaScript animations combined with the performance of native browser APIs.

It looks like this:

```jsx
<motion.div animate={{ x: 0 }} />
```

It does all this:

-   [Springs](https://www.framer.com/docs/transition/#spring?utm_source=motion-readme-docs)
-   [Keyframes](https://www.framer.com/docs/animation/##keyframes?utm_source=motion-readme-docs)
-   [Layout animations](https://www.framer.com/docs/layout-animations/?utm_source=motion-readme-docs)
-   [Shared layout animations](https://www.framer.com/docs/layout-animations/#shared-layout-animations?utm_source=motion-readme-docs)
-   [Gestures (drag/tap/hover)](https://www.framer.com/docs/gestures/?utm_source=motion-readme-docs)
-   [Scroll animations](https://www.framer.com/docs/scroll-animations?utm_source=motion-readme-docs)
-   [SVG paths](https://www.framer.com/docs/component/###svg-line-drawing?utm_source=motion-readme-docs)
-   [Exit animations](https://www.framer.com/docs/animate-presence/?utm_source=motion-readme-docs)
-   Server-side rendering
-   [Hardware-accelerated animations](https://www.framer.com/docs/animation/#hardware-accelerated-animations?utm_source=motion-readme-docs)
-   [Orchestrate animations across components](https://www.framer.com/docs/animation/##orchestration?utm_source=motion-readme-docs)
-   [CSS variables](https://www.framer.com/docs/component/##css-variables?utm_source=motion-readme-docs)

...and a whole lot more.

## Get started

### 🐇 Quick start

Install `motion` with via your package manager:

```
npm install motion
```

Then import the `motion` component:

```jsx
import { motion } from "motion/react"

export function Component({ isVisible }) {
    return <motion.div animate={{ opacity: isVisible ? 1 : 0 }} />
}
```

### 💎 Contribute

-   Want to contribute to Motion One? Our [contributing guide](https://github.com/framer/motion/blob/master/CONTRIBUTING.md) has you covered.

### 👩🏻‍⚖️ License

-   Motion One for React is MIT licensed.

### ✨ Framer

Motion One powers Framer animations, the web builder for creative pros. Design and ship your dream site. Zero code, maximum speed.
<br/>

<p align="center">
  <a href="https://www.framer.com?utm_source=motion-readme">
    <img src="https://framerusercontent.com/images/atXqxn4JhKm4LXVncdNjkKV7yCU.png" width="140" alt="Start for free" />
  </a>
</p>
<br/>
<p align="center">
  <a href="https://www.framer.com?utm_source=motion-readme">
    <img src="https://framerusercontent.com/images/pMSOmGP2V8sSaZRV2D7i4HTBTe4.png" width="1000" alt="Framer Banner" />
  </a>
</p>
