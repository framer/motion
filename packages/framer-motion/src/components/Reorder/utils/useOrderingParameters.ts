import { useEffect, useRef, useState } from "react"

export function useOrderingParameters(ref: React.MutableRefObject<any>) {
    const [axis, setAxis] = useState<"x" | "y">("x")
    const itemsPerAxis = useRef<number>(0)
    const [isWrappingItems, setIsWrappingItems] = useState(false)

    useEffect(() => {
        if (!ref.current) return

        const getOrderingParameters = () => {
            const childrenElements = ref.current?.children
            if (childrenElements.length <= 1) return
            const newAxis =
                childrenElements[0].offsetTop === childrenElements[1].offsetTop
                    ? "x"
                    : "y"
            setAxis(newAxis)
            const offset = newAxis === "x" ? "offsetTop" : "offsetLeft"
            itemsPerAxis.current = childrenElements.length
            setIsWrappingItems(false)
            for (let i = 1; i < childrenElements.length; i++) {
                if (
                    childrenElements[i][offset] >
                    childrenElements[i - 1][offset]
                ) {
                    itemsPerAxis.current = i
                    setIsWrappingItems(i !== childrenElements.length && i !== 1)
                    break
                }
            }
        }
        getOrderingParameters()

        const observer = new ResizeObserver(getOrderingParameters)
        observer.observe(ref.current)
        return () => {
            observer.disconnect()
        }
    }, [])
    return { axis, isWrappingItems, itemsPerAxis }
}
