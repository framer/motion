import React from "react"
const { useEffect, useLayoutEffect } = React
import { isBrowser } from "./is-browser"

export const useIsomorphicLayoutEffect = isBrowser ? useLayoutEffect : useEffect
