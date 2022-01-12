import { useEffect, useLayoutEffect } from "react"
import { isBrowser } from "framer-motion"

export const useIsomorphicLayoutEffect = isBrowser ? useLayoutEffect : useEffect
