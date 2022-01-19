<p align="center">
  <img src="https://user-images.githubusercontent.com/22095598/123793419-f5528800-d8e1-11eb-8c5f-e2dad45a9c81.png" width="108" height="108" alt="Framer Motion" />
</p>
<h1 align="center">Framer Motion</h1>
<h3 align="center">
  An open source and production-ready motion<br>library for React on the web.
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

Framer Motion is an open source, production-ready library that's designed for all creative developers.

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
-   Orchestrate animations across components
-   CSS variables

...and a whole lot more.

## Get started

### 🐇 Quick start

```
npm install framer-motion
```

```jsx
import { motion } from "framer-motion"

export const MyComponent = ({ isVisible }) => (
    <motion.div animate={{ opacity: isVisible ? 1 : 0 }} />
)
```

### 📚 Docs

Check out [our documentation](https://www.framer.com/docs/) for guides and a full API reference.

Or checkout [our examples](https://www.framer.com/docs/examples/) for inspiration.

### 🛠 Contribute

Want to contribute to Framer Motion? Our [contributing guide](https://github.com/framer/motion/blob/master/CONTRIBUTING.md) has you covered.

### 👩🏻‍⚖️ License

Framer Motion is MIT licensed.

## Framer

Get on the same page as your designers before production. Get started with [design and prototyping in Framer](https://www.framer.com/).
