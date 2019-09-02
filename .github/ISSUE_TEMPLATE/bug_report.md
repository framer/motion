---
name: Bug report
about: Let us know about some broken functionality
title: "[BUG]"
labels: bug
assignees: ''

---

**1. Read the [FAQs](#faqs) 👇**

**2. Describe the bug**
Give a clear and concise description of what the bug is.

**3. Provide a CodeSandbox reproduction of the bug**
This allows us to quickly follow the reproduction steps.

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

### `AnimatePresence` isn't working

Have all of its immediate children got a unique `key` prop that **remains the same for that component every render**?

```jsx
// Bad: The index could be given to a different component if the order of items changes
<AnimatePresence>
  {items.map((item, index) => <Component key={index} />))}
</AnimatePresence>
```

```jsx 
// Good: The item ID is unique to each component
<AnimatePresence>
  {items.map((item, index) => <Component key={item.id} />)}
</AnimatePresence>
```

Is the `AnimatePresence` correctly outside of the controlling conditional? `AnimatePresence` must be rendered whenever you expect an `exit` animation to run - it can't do so if it's unmounted!

```jsx
// Bad: AnimatePresence is unmounted - exit animations won't run
{isVisible && (
  <AnimatePresence>
    <Component />
  </AnimatePresence>
)}
```

```jsx
// Good: Only the children are unmounted - exit animations will run
<AnimatePresence>
  {isVisible && <Component />}
</AnimatePresence>
```
