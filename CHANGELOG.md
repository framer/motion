# Changelog

Framer Motion adheres to [Semantic Versioning](http://semver.org/).

## [1.1.1] 2019-07-04

### Fixed

-   Cancelling `drag` and `pan` gestures on component unmount.
-   Previously unseen props in `animate` animate correctly.
-   Fixing reading SVG attributes from DOM.

## [1.1.0] 2019-07-03

### Added

-   `AnimatePresence` component for controlling mount/unmount animations.
-   `positionTransition` prop for animating when the layout of a component changes.

## [1.0.5] 2019-07-02

### Fixed

-   Fixing SVG path props.

## [1.0.4] 2019-07-01

### Fixed

-   Moving SVG path props to `MotionStyle` type.
-   Changing `MakeMotion` to accept either `MotionValue<string>` OR `MotionValue<number>`.

## [1.0.3] 2019-07-01

### Fixed

-   Moving `dragConstraints` to a ref if a component re-renders mid gesture.
-   Only applying `dragConstraints` on render if component isn't currently dragging.

## [1.0.2] 2019-06-28

### Fixed

-   Making `when` type more permissive for passing in implicitly typed, pre-defined `variants`.
-   Not blocking default browser behaviour when dragging is initiated on draggable element's `select`, `input`, `textarea` elements.

## [1.0.1] 2019-06-27

### Fixed

-   Fixing `useSpring` unsubscriptions.

## [1.0.0] 2019-06-26

### Added

-   Improved SVG support.

## [0.20.2] 2019-06-20

### Fixed

-   Ensuring each `MotionValue` receives one `MotionValuesMap` update subscriber.

## [0.20.1] 2019-06-20

### Fixed

-   Adding `x`/`y` `MotionValue`s to the `useDrag` dependency list.
-   Ensure hover events only fire as a result of mouse interactions.

## [0.20.0] 2019-06-18

### Feature

-   Allowing SVG `motion` components to accept `MotionValue`s via attributes.
-   Adding SVG attribute types to `Target`.

## [0.19.2] 2019-06-13

### Fixed

-   Detecting `originZ` as a `transform-origin` value.

## [0.19.1] 2019-06-13

### Added

-   `initial={false}` to shadow contents of `animate` thereby disabling on mount animation.
-   `AnimationControls.set` for imperative setting of values.

### Fixed

-   Resolve animations only after a defined `delay` to ensure `velocity` is only resolved as an animation begins on a value.

## [0.19.0] 2019-06-13

### Upgraded

-   `stylefire@5.0.0` - Changes `originX`/`Y` default to `"50%"`.

## [0.18.6] 2019-06-13

### Added

-   Production and prototype environment-specific tsdocs.

## [0.18.5] 2019-06-07

### Fixed

-   Properly cleaning up event listeners in tap gesture.
-   Only starting pan gesture when pointer has moved more than one point.
-   Applying `transformPagePoint` to `dragConstraints` when it's a `RefObject<Element>` to ensure it works in scaled environments.
-   Fixing `dragElastic` behaviour when `dragMomentum={false}`.

## [0.18.4] 2019-05-30

### Fixed

-   Preventing default browser behaviours on draggable elements.

## [0.18.3] 2019-05-30

### Fixed

-   Fixing drag when a multitouch gesture starts.

## [0.18.2] 2019-05-22

### Fixed

-   Application of `delay`.

## [0.18.1] 2019-05-21

### Fixed

-   Fixed regex detection for fallbacks containing a decimal.

## [0.18.0] 2019-05-21

### Added

-   `dragConstraints` can now be set as a `React.RefObject`.

### Fixed

-   Support CSS variables with metadata
-   Fixing circular CSS dependencies

## [0.17.2] 2019-05-15

### Fixed

-   Even if a `motion` component **wasn't** inheriting variant changes, it'd still register with its parent, meaning it'd be considered during stagger duration calculations.
-   Only firing `onDragEnd` if dragging has actually happened.

## [0.17.1] 2019-05-13

### Fixed

-   `dragTransition` now listed as a `useDraggable` dependency.

## [0.17.0] 2019-05-09

### Added

-   Experimental `useAnimatedState` Hook for animating arbitrary values.

## [0.16.11] 2019-05-08

### Fixed

-   Disabling the animation of `zIndex`.
-   Making components without variants or animation-controlling props invisible to `staggerChildren`.

## [0.16.10] 2019-05-07

### Updated

-   API

### Fixed

-   Variant propagation when rerendering children

## [0.16.9] 2019-05-07

### Fixed

-   Using `transition` and `transitionEnd` as direct values on the `animate` prop on subsequent renders.
-   Rounding `zIndex`.
-   `AnimationControls.start` now accepts the same `AnimationDefinition` as `ValueAnimationControls.start`.

## [0.16.8] 2019-05-06

### Fixed

-   Cancelling pan gesture when the move events have no mouse button.

## [0.16.7] 2019-05-06

### Fixed

-   Fixing propagation of unsetting variant overrides.
-   Making variant inheritance more permissive.

## [0.16.6] 2019-05-02

### Fixed

-   Improved handling of attempting to animate between non-animatable and animatable values.

## [0.16.5] 2019-05-01

### Added

-   Adds array and object support to `transform`.

### Fixed

-   Makes boxShadow and other complex value type support more robust.
-   Fixing overwriting `transform`.

## [0.16.4] 2019-04-30

-   Updating deps.

## [0.16.3] 2019-04-30

### Added

-   `shadow` to `CustomValueTypes`.

## [0.16.2] 2019-04-30

### Fixed

-   Fixed propagation of `initial` in `static` mode.
-   Fixing animations from values that are read as "none".

## [0.16.1] 2019-04-25

### Fixed

-   Filtering pointer events not from the primary pointer (ie non-left clicks for mouse).
-   Fixing drag in Android devices by adding aggressive viewport scroll blocking. This will need dialling back down when it comes to open sourcing Framer Motion so, for instance, a horizontal carousel doesn't block vertical scrolling.

## [0.16.0] 2019-04-19

### Added

-   `custom` prop for dynamic variants.

### Removed

-   `useAnimation` no longer takes `variants` or `defaultTransition` arguments (provide these to the component).

### Fixed

-   Improving comparison for `animate` prop to account for keyframe arrays.
-   Adding drag point in `onDragStart` and `onDragEnd` callbacks.

## [0.15.2] 2019-04-17

### Added

-   Support for CSS variables.

### Fixed

-   `onDragEnd` not returning transformed point.
-   Fixing use of `variants` prop with `useAnimation`.

## [0.15.1] 2019-04-16

### Added

-   `HTMLMotionProps` and `SVGMotionProps`.

## [0.15.0] 2019-04-16

### Added

-   `onPanSessionStart` event handler.

### Changed

-   `useViewportScrollValues` => `useViewportScroll`.

### Added

-   `ease` can now be an array for keyframes animations.

### Removed

-   `easings` prop.

## [0.14.3] 2019-04-12

### Fixed

-   Only firing `value.onChange` when value actually changes.

## [0.14.2] 2019-04-11

### Fixed

-   Updating `hey-listen`.

## [0.14.1] 2019-04-11

### Added

-   Explicit support for the `radius` value.

## [0.14.0] 2019-04-10

### Changed

-   Making special value support configurable

## [0.13.0] 2019-04-08

### Changed

-   `useTransformedValue` => `useTransform`

### Added

-   `transform(value, input, output, options)` overload.

## [0.12.2] 2019-04-08

### Changed

-   Added new methods to `safeWindow` SSR window mocking.

### Fixed

-   Deleting unused props from `style` object rather than setting to `undefined`. [#99](https://github.com/framer/motion/pull/99)

## [0.12.1] 2019-04-03

### Fixed

-   `size` works with `while` gestures.

## [0.12.0] 2019-04-03

### Changed

-   `useCycle([...args])` -> `useCycle(...args)`

### Added

-   `static` components reflect changes in `initial`.

### Fixed

-   Dragging doesn't break during re-renders.
-   `useCycle` setter is independent from render cycle.

### Removed

-   `useCycle` no longer has the ability to start at a different index.

## [0.11.1] 2019-04-02

### Added

-   `onDragTransitionEnd`

### Upgraded

-   Popmotion libraries.

## [0.11.0] 2019-04-01

### Changed

-   `value.addUpdateSubscription` => `value.onChange`
-   `value.addRenderSubscription` => `value.onRenderRequest` (and made internal)

### Upgraded

-   `popmotion@8.6.5`

### Fixed

-   Variants propagate to children even if not present on parent.

## [0.10.2] 2019-03-27

### Changed

-   Updating docs to avoid single-letter `event` vars.

## [0.10.1] 2019-03-27

### Fixed

-   Fixing `TargetAndTransform` type to omit CSS-native `rotate` property.

## [0.10.0] 2019-03-26

### Changed

-   `press` -> `whileTap`
-   `hover` -> `whileHover`

## [0.9.4] 2019-03-26

### Fixed

-   Fixing HTML types.

## [0.9.3] 2019-03-25

### Added

-   Exporting `MotionTransform` type.

## [0.9.2] 2019-03-22

### Added

-   Added support for `CustomValueType` in `unwrapMotionValue`.

## [0.9.0] 2019-03-22

### Added

-   Added `dragDirectionLock` prop.

### Removed

-   `"lockDirection"` from `dragEnabled`.

### Changed

-   Renamed `dragEnabled` to `drag`.

## [0.8.8] 2019-03-20

## [0.8.7] 2019-03-20

### Added

-   Adding `transition` argument to `animation.start()`.

### Fixed

-   No longer fire tap gesture if parent is dragging.
-   Adjusting default `inertia` settings to more naturally incorporate velocity.
-   Killing drag momentum on subsequent `pressDown`.
-   Preventing pan velocity from adjusting draggable parents that have not received `dragPropagation`.
-   Updating of `dragConstraints` repositions the draggable element to adhere to the new values

## [0.8.6] 2019-03-19

### Added

-   `Point.relativeTo`
-   `transform`

### Fixed

-   Statefull style bug.
-   Fixing `Promise` resolution with `animate.start()` when fired pre-mount.

## [0.8.5] 2019-03-15

### Fix

-   Blocking extra gesture props from being passed to DOM.
-   Upgrading `@popmotion/popcorn` to fix Jest bug.

## [0.8.4] 2019-03-15

### Fix

-   Fixing `style` set as `null`.

## [0.8.3] 2019-03-14

### Update

-   Adding support for custom values.

## [0.8.2] 2019-03-14

### Update

-   Updating tsdocs for `MotionValue`.

## [0.8.1] 2019-03-12

### Update

-   Updating dependencies.

## [0.8.0] 2019-03-12

### Changed

-   `originX`, `originY`, `pathLength`, `pathOffset` changed from percent to progress value types.

## [0.7.5] 2019-03-11

### Added

-   Exporting `AnimationControls`.

## [0.7.4] 2019-03-11

### Added

-   Exporting `animationControls` and `motionValue` for internal use.

## [0.7.3] 2019-03-08

### Added

-   Passing `panInfo` through to `onDragStart` and `onDragEnd`.

## [0.7.2] 2019-03-07

### Fixed

-   `easings` property on `keyframes` now maps correctly to easing functions.

## [0.7.1] 2019-03-07

### Fixed

-   Enforcing keyframes animation if target is array.
-   Orchestration props in `transition` prop weren't being respected by variants with no `transition` of their own.

## [0.7.0] 2019-03-07

### Added

-   Animation targets can be set as `keyframes`.

## [0.6.8] 2019-03-05

### Fixed

-   Updating `dragConstraints` when they change.

## [0.6.7] 2019-03-04

### Updated

-   Removing GPU-acceleration for `static` components.
-   Adding `customStyles` plugin.

## [0.6.6] 2019-02-29

### Updated

-   `stylefire@2.4.3`

## [0.6.4] 2019-02-22

### Added

-   Exporting `MotionContext`.

### Update

-   Updated `popmotion@8.6.3` to improve synchronisation across tweens when yoyoing.

## [0.6.3] 2019-02-21

### Fixed

-   If `transformPagePoint` is present, transforming initial point.

## [0.6.2] 2019-02-21

### Fixed

-   Recognising `press` when it's the lone gesture.

## [0.6.1] 2019-02-20

### Fixed

-   Fixed an issue where values set to `style` would overwrite `animate` values even if they hadn't changed.

## [0.6.0] 2019-02-20

### Added

-   `static` prop. Set `static` on a motion component to prevent animation and interaction.

### Removed

-   `render`

## [0.5.2] 2019-02-20

### Fixed

-   Animating unit-converting values on mount.

## [0.5.1] 2019-02-19

### Added

-   Exporting `MotionComponents`, `CustomMotionComponent`, `HTMLMotionComponents` and `SVGMotionComponents` types.
-   Exporting `safeWindow`.

## [0.5.0] 2019-02-19

### Added

-   `onDrag` event listener
-   Exporting `MotionStyles` type.

### Changed

-   `tap` -> `press`

## [0.4.5] 2019-02-15

### Fixed

-   Fixing `originX` and `originY` SSR.
-   Updating `style` props to overwrite CSS `rotate`, `scale` and `perspective`.

## [0.4.3] 2019-02-14

### Fixed

-   Rendering `initial` properties via Stylefire when component mounts to ensure its in-sync with all transform values set in `initial` that might not later be rendered.
-   Exporting `htmlElements`, `svgElements` and `createMotionComponent` as their exclusion was causing errors with the output declaration file.

## [0.4.2] 2019-02-14

### Changed

-   Exporting `useExternalRef`.

## [0.4.1] 2019-02-13

### Changed

-   Simplifying inline tsdocs.

## [0.4.0] 2019-02-12

### Changed

-   Standardizing `(event, pointInfo)` as signature for gesture callbacks.

### Fixed

-   Gesture priority bugs

## [0.3.2] 2019-02-08

### Changed

-   Added TSDocs for `useCycle`

## [0.3.0] 2019-02-05

### Changed

-   `duration` and `delay` are now defined as seconds.
-   `tapActive` -> `tap`
-   `hoverActive` -> `hover`
-   `drag` -> `dragEnabled`
