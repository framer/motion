import { MotionProps } from "../../../motion/types"
import { isValidMotionProp } from "../../../motion/utils/valid-prop"

let isPropValid = (key: string) => !isValidMotionProp(key)

/**
 * Emotion and Styled Components both allow users to pass through arbitrary props to their components
 * to dynamically generate CSS. They both use the `@emotion/is-prop-valid` package to determine which
 * of these should be passed to the underlying DOM node.
 *
 * However, when styling a Motion component `styled(motion.div)`, both packages pass through *all* props
 * as it's seen as an arbitrary component rather than a DOM node. Motion only allows arbitrary props
 * passed through the `custom` prop so it doesn't *need* the payload or computational overhead of
 * `@emotion/is-prop-valid`, however to fix this problem we need to use it.
 *
 * By making it an optionalDependency we can offer this functionality only in the situations where it's
 * actually required.
 */
try {
    const emotionIsPropValid = require("@emotion/is-prop-valid").default

    isPropValid = (key: string) => {
        // Handle events explicitly as Emotion validates them all as true
        if (key.startsWith("on")) {
            return !isValidMotionProp(key)
        } else {
            return emotionIsPropValid(key)
        }
    }
} catch {
    // We don't need to actually do anything here - the fallback is the existing `isPropValid`.
}

export function filterProps(props: MotionProps) {
    const domProps = {}

    for (const key in props) {
        if (isPropValid(key)) domProps[key] = props[key]
    }

    return domProps
}
