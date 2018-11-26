import { useMemo } from "react"

/**
 * Maps the output of callbacks to one or more `MotionValue`s.
 *
 * ## Import
 *
 * import { useOutput } from 'framer-motion';
 *
 * ## Usage
 *
 * ```javascript
 * export default () => {
 *    const scrollLeft = useMotionValue(0)
 *    const updateScrollLeft = useOutput([{ 'currentTarget.scrollLeft': scrollLeft }])
 *
 *    return <div onScroll={updateScrollLeft} />
 * };
 * ```
 *
 * @param [Map[]] maps
 */
const useOutput = map => {
    return useMemo(() => e => {}, [])
}
