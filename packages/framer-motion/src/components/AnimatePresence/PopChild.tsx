import * as React from "react"
import { useRef, useInsertionEffect, useId } from "react"

interface Size {
    width: number
    height: number
    top: `${number}px` | "auto"
    left: `${number}px` | "auto"
}

interface Props {
    children: React.ReactElement
    isPresent: boolean
}

interface MeasureProps extends Props {
    childRef: React.RefObject<HTMLElement>
    sizeRef: React.RefObject<Size>
}

/**
 * Measurement functionality has to be within a separate component
 * to leverage snapshot lifecycle.
 */
class PopChildMeasure extends React.Component<MeasureProps> {
    getSnapshotBeforeUpdate(prevProps: MeasureProps) {
        const element = this.props.childRef.current
        if (element && prevProps.isPresent && !this.props.isPresent) {
            const { position } = getComputedStyle(element)
            const size = this.props.sizeRef.current!
            size.height = element.offsetHeight || 0
            size.width = element.offsetWidth || 0
            size.top = size.left = "auto"

            /**
             * If this element is position: relative and the parent has
             * padding, we need to explicitly set a top and/or left.
             */
            if (position === "relative" && element.offsetParent) {
                const { paddingTop, paddingLeft } = getComputedStyle(
                    element.offsetParent
                )
                if (parseFloat(paddingTop)) {
                    size.top = `${element.offsetTop}px`
                }
                if (parseFloat(paddingLeft)) {
                    size.left = `${element.offsetLeft}px`
                }
            }
        }

        return null
    }

    /**
     * Required with getSnapshotBeforeUpdate to stop React complaining.
     */
    componentDidUpdate() {}

    render() {
        return this.props.children
    }
}

export function PopChild({ children, isPresent }: Props) {
    const id = useId()
    const ref = useRef<HTMLElement>(null)
    const size = useRef<Size>({
        width: 0,
        height: 0,
        top: "auto",
        left: "auto",
    })

    /**
     * We create and inject a style block so we can apply this explicit
     * sizing in a non-destructive manner by just deleting the style block.
     *
     * We can't apply size via render as the measurement happens
     * in getSnapshotBeforeUpdate (post-render), likewise if we apply the
     * styles directly on the DOM node, we might be overwriting
     * styles set via the style prop.
     */
    useInsertionEffect(() => {
        const { width, height, top, left } = size.current
        if (isPresent || !ref.current || !width || !height) return

        ref.current.dataset.motionPopId = id

        const style = document.createElement("style")
        document.head.appendChild(style)
        style.sheet?.insertRule(`
          [data-motion-pop-id="${id}"] {
            position: absolute !important;
            width: ${width}px !important;
            height: ${height}px !important;
            top: ${top} !important;
            left: ${left} !important;
          }
        `)

        return () => {
            document.head.removeChild(style)
        }
    }, [isPresent])

    return (
        <PopChildMeasure isPresent={isPresent} childRef={ref} sizeRef={size}>
            {React.cloneElement(children, { ref })}
        </PopChildMeasure>
    )
}
