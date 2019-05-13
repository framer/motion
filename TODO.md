# Potential filesize savings

Framer Motion in its entirety costs about 25kb. Some of this weight will currently be shaken out but a lot of it lives monolithically in `motion` components. There's ways of saving quite a lot of this weight:

## Make `motion` a `Proxy`

Making `motion` a `Proxy` that dynamically returns cached motion components for each element rather than generating one for every HTML and SVG element will remove at least a kilobyte, reduce memory usage and cut start-up ties.

## Making `motion` configurable

The `motion` component itself is just responsible for making the `MotionValuesMap` and exposes an API to be configured. The DOM components inject functionality and it's currently written in a way that could itself be configured by a user. This stuff is all easily extractable:

-   Gestures
-   CSS variable support
-   Unit conversion
-   FLIP (doesn't exist yet)

We could offer a way to use "bare" `motion` components and allow the user to manually add the functionality they want.

## Popmotion

### `vectorAction`

Currently every Popmotion animation is created using a hof called `vectorAction` that allows animations that work with single numbers to be called with objects, colors etc. As we already handle individual values we can simply import the single-value versions of the animations.

### API-less

Popmotion animations are also allowed to return custom APIs, but in Framer Motion we only use `stop`. We could slim these animations down by removing these extra APIs.
