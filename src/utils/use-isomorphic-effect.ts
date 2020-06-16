import { useEffect, useLayoutEffect } from "react"
const isBrowser = typeof window !== "undefined"

export const useIsomorphicLayoutEffect = isBrowser ? useLayoutEffect : useEffect
