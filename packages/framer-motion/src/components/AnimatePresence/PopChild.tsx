import * as React from "react"
import { useRef, useInsertionEffect, useId } from "react"

interface Size {
    width: number
    height: number
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
        if (prevProps.isPresent && !this.props.isPresent) {
            const element = this.props.childRef.current
            const size = this.props.sizeRef.current
            size!.height = element?.offsetHeight || 0
            size!.width = element?.offsetWidth || 0
        }

        return null
    }

    componentDidUpdate() {}

    render() {
        return this.props.children
    }
}

export function PopChild({ children, isPresent }: Props) {
    const id = useId()
    const ref = useRef<HTMLElement>(null)
    const size = useRef({ width: 0, height: 0 })

    /**
     * We create and inject a style block so we can apply this explicit
     * sizing in a non-destructive manner by just deleting the style block.
     *
     * We can't apply the size via render as the measurement happens
     * in getSnapshotBeforeUpdate (post-render), likewise if we apply the
     * styles directly on the DOM node, we might be overwriting
     * styles set via the style prop.
     */
    useInsertionEffect(() => {
        const { width, height } = size.current
        if (isPresent || !ref.current || !width || !height) return

        ref.current.dataset.motionPopId = id

        const style = document.createElement("style")
        document.head.appendChild(style)
        style.appendChild(
            document.createTextNode(`
          [data-motion-pop-id="${id}"] {
            position: absolute !important;
            width: ${width}px !important;
            height: ${height}px !important;
          }
        `)
        )

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
