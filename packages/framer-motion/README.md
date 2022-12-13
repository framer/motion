<p align="center">
  <img src="https://framerusercontent.com/images/48ha9ZR9oZQGQ6gZ8YUfElP3T0A.png" width="50" height="50" alt="Framer Motion Icon" />
</p>
<h1 align="center">Framer Motion</h1>
<h3 align="center">
  An open source motion library for React, <a href="https://www.framer.com">made by Framer</a>.
</h3>

<br>

<p align="center">
  <a href="https://www.npmjs.com/package/framer-motion" target="_blank">
    <img src="https://img.shields.io/npm/v/framer-motion.svg?style=flat-square" />
  </a>
  <a href="https://www.npmjs.com/package/framer-motion" target="_blank">
  <img src="https://img.shields.io/npm/dm/framer-motion.svg?style=flat-square" />
  </a>
  <a href="https://twitter.com/framer" target="_blank">
  <img src="https://img.shields.io/twitter/follow/framer.svg?style=social&label=Follow"  />
  </a>
  <a href="https://discord.gg/DfkSpYe" target="_blank">
  <img src="https://img.shields.io/discord/308323056592486420.svg?logo=discord&logoColor=white" alt="Chat on Discord">
  </a>
</p>

<br>

Framer Motion is an open source, production-ready library that’s designed for all creative developers.

It looks like this:

```jsx
<motion.div animate={{ x: 0 }} />
```

It does all this:

-   Springs
-   Keyframes
-   Layout animations
-   Shared layout animations
-   Gestures (drag/tap/hover)
-   SVG paths
-   Exit animations
-   Server-side rendering
-   Hardware-accelerated animations
-   Orchestrate animations across components
-   CSS variables

...and a whole lot more.

## Get started

### 🐇 Quick start

Install `framer-motion` with via your package manager:

```
npm install framer-motion
```

Then import the `motion` component:

```jsx
import { motion } from "framer-motion"

export const MyComponent = ({ isVisible }) => (
    <motion.div animate={{ opacity: isVisible ? 1 : 0 }} />
)
```

### 📚 Docs

-   Check out [our documentation](https://www.framer.com/docs/) for guides and a full API reference.
-   Or see [our examples](https://www.framer.com/docs/examples/) for inspiration.

### 💎 Contribute

-   Want to contribute to Framer Motion? Our [contributing guide](https://github.com/framer/motion/blob/master/CONTRIBUTING.md) has you covered.

### 👩🏻‍⚖️ License

-   Framer Motion is MIT licensed.

### ✨ Framer

-   Design and publish sites that inspire. [Try Framer for free](https://www.framer.com/).
