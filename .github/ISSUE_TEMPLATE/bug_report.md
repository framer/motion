---
name: Bug report
about: Let us know about some broken functionality
title: "[BUG]"
labels: bug
assignees: ""
---

**1. Read the [FAQs](#faqs) 👇**

**2. Describe the bug**

Give a clear and concise description of what the bug is.

**3. IMPORTANT: Provide a CodeSandbox reproduction of the bug**

A CodeSandbox minimal reproduction will allow us to quickly follow the reproduction steps. **Without one, this bug report won't be accepted.**

**4. Steps to reproduce**

Steps to reproduce the behavior:

1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**5. Expected behavior**

A clear and concise description of what you expected to happen.

**6. Video or screenshots**

If applicable, add a video or screenshots to help explain the bug.

**7. Environment details**

If applicable, let us know which OS, browser, browser version etc you're using.

## FAQs

### `"use client"` error

We would accept a PR implementing `"use client"` (see [previous discussion](https://github.com/framer/motion/issues/2054)). In the meantime a workaround is:

```javascript
// motion.js
"use client"
export * from "framer-motion"

// other.js
import { motion } from "./motion"
```

### I'm having a problem with Next/React Router etc

Please reproduce the bug in a CodeSandbox without the use of this library.

### Framer Motion won't install

Framer Motion 7+ uses React 18 as a minimum. If you can't upgrade React, install the latest version of Framer Motion 6.

### `height: "auto"` is jumping

Animating to/from `auto` requires measuring the DOM. There's no perfect way to do this and if you have also applied padding to the same element, these measurements might be wrong.

The recommended solution is to move padding to a child element. See [this issue](https://github.com/framer/motion/issues/368) for the full discussion.

### Preact isn't working

Framer Motion isn't compatible with Preact.

### `AnimatePresence` isn't working

Have all of its immediate children got a unique `key` prop that **remains the same for that component every render**?

```jsx
// Bad: The index could be given to a different component if the order of items changes
<AnimatePresence>
    {items.map((item, index) => (
        <Component key={index} />
    ))}
</AnimatePresence>
```

```jsx
// Good: The item ID is unique to each component
<AnimatePresence>
    {items.map((item, index) => (
        <Component key={item.id} />
    ))}
</AnimatePresence>
```

Is the `AnimatePresence` correctly outside of the controlling conditional? `AnimatePresence` must be rendered whenever you expect an `exit` animation to run - it can't do so if it's unmounted!

```jsx
// Bad: AnimatePresence is unmounted - exit animations won't run
{
    isVisible && (
        <AnimatePresence>
            <Component />
        </AnimatePresence>
    )
}
```

```jsx
// Good: Only the children are unmounted - exit animations will run
<AnimatePresence>{isVisible && <Component />}</AnimatePresence>
```
