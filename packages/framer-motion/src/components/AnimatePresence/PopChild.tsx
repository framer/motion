"use client"

import { isHTMLElement, type VisualElement } from "motion-dom"
import * as React from "react"
import { useContext, useId, useInsertionEffect, useRef } from "react"

import { MotionConfigContext } from "../../context/MotionConfigContext"
import { useComposedRefs } from "../../utils/use-composed-ref"
import { useIsomorphicLayoutEffect } from "../../utils/use-isomorphic-effect"

interface Size {
    width: number
    height: number
    top: number
    left: number
    right: number
    bottom: number
    direction: string
    page?: number[]
}

interface Props {
    children: React.ReactElement
    isPresent: boolean
    anchorX?: "left" | "right"
    anchorY?: "top" | "bottom"
    root?: HTMLElement | ShadowRoot
    pop?: boolean
    popNode?: React.RefObject<VisualElement | undefined>
}

interface MeasureProps extends Props {
    getElement: () => unknown
    sizeRef: React.RefObject<Size>
}

/**
 * The element's position, plus its ancestors' scroll (across shadow roots),
 * so a scroll position clamped by content shrinking, in the page or a
 * scrollable element, doesn't read as the element moving.
 */
const getPagePoint = (element: Element) => {
    let { left, top } = element.getBoundingClientRect()
    let node: Element | null | undefined = element
    while (
        (node = node.parentElement || (node.parentNode as ShadowRoot)?.host)
    ) {
        left += node.scrollLeft
        top += node.scrollTop
    }
    return [left, top]
}

/**
 * Pop rule corrections, written by AnimatePresence once every exiting child
 * has measured, so many children exiting at once don't each force a layout.
 */
export const popCorrections: VoidFunction[] = []

/**
 * Measurement functionality has to be within a separate component
 * to leverage snapshot lifecycle.
 */
class PopChildMeasure extends React.Component<MeasureProps> {
    getSnapshotBeforeUpdate(prevProps: MeasureProps) {
        const element = this.props.getElement()
        if (isHTMLElement(element) && prevProps.isPresent && !this.props.isPresent && this.props.pop !== false) {
            const parent = element.offsetParent
            const parentWidth = isHTMLElement(parent)
                ? parent.offsetWidth || 0
                : 0
            const parentHeight = isHTMLElement(parent)
                ? parent.offsetHeight || 0
                : 0

            const computedStyle = getComputedStyle(element)
            const size = this.props.sizeRef.current!
            size.height = parseFloat(computedStyle.height)
            size.width = parseFloat(computedStyle.width)
            size.top = element.offsetTop
            size.left = element.offsetLeft
            size.right = parentWidth - size.width - size.left
            size.bottom = parentHeight - size.height - size.top
            size.direction = computedStyle.direction
            size.page = getPagePoint(element)
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

export function PopChild({ children, isPresent, anchorX, anchorY, root, pop, popNode }: Props) {
    const id = useId()
    const ref = useRef<HTMLElement>(null)
    const size = useRef<Size>({
        width: 0,
        height: 0,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        direction: "ltr",
    })
    const sheet = useRef<CSSStyleSheet | null>(null)
    const { nonce } = useContext(MotionConfigContext)
    /**
     * In React 19, refs are passed via props.ref instead of element.ref.
     * We check props.ref first (React 19) and fall back to element.ref (React 18).
     *
     * The composed ref is only used when popping the child out (pop !== false),
     * so we avoid reading children.props.ref otherwise. In React 18.3 that read
     * triggers a spurious "`ref` is not a prop" warning getter (#3745).
     */
    const childRef =
        pop !== false
            ? ((children.props as { ref?: React.Ref<HTMLElement> })?.ref ??
              (children as unknown as { ref?: React.Ref<HTMLElement> })?.ref)
            : undefined
    const composedRef = useComposedRefs(ref, childRef)

    /**
     * The child's element: the one our ref reached or, if the child can't
     * be given a ref (for instance a function component that doesn't
     * forward it), its outermost motion component's element (#2503).
     */
    const getElement = () =>
        ref.current || (popNode?.current?.current as HTMLElement | undefined)

    const insertPopRule = () => {
        const { width, height, top, left, right, bottom, direction } = size.current
        const isRTL = direction === "rtl"
        const x = anchorX === "left"
            ? (isRTL ? `right:${right}` : `left:${left}`)
            : (isRTL ? `left:${left}` : `right:${right}`)
        const y = anchorY === "bottom" ? `bottom:${bottom}` : `top:${top}`

        sheet.current?.insertRule(
            `[data-motion-pop-id="${id}"]{position:absolute!important;width:${width}px!important;height:${height}px!important;${x}px!important;${y}px!important}`
        )
    }

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
        const { width, height } = size.current
        const element = getElement()
        if (isPresent || pop === false || !element || !width || !height) return

        element.dataset.motionPopId = id

        /**
         * Use the element's own document so this works when rendering
         * into another window or iframe (e.g. via window.open()).
         */
        const doc = element.ownerDocument
        const style = doc.createElement("style")
        if (nonce) style.nonce = nonce

        const parent = root ?? doc.head
        parent.appendChild(style)

        sheet.current = style.sheet
        insertPopRule()

        return () => {
            sheet.current = null
            element.removeAttribute("data-motion-pop-id")
            if (parent.contains(style)) {
                parent.removeChild(style)
            }
        }
    }, [isPresent])

    /**
     * Popping the element out of the layout can move its offsetParent,
     * which we've pinned it to. For instance, a bottom-anchored or centred
     * container shrinks around its remaining children (#2348). So once the
     * whole commit is in the DOM (insertion effects run before later
     * siblings are added), measure how far it moved. AnimatePresence then
     * offsets it back, once every popped sibling has measured.
     */
    useIsomorphicLayoutEffect(() => {
        if (isPresent || !sheet.current) return

        const s = size.current
        const [x, y] = getPagePoint(getElement()!)
        const dx = s.page![0] - x
        const dy = s.page![1] - y

        if (dx || dy) {
            popCorrections.push(() => {
                s.left += dx
                s.right -= dx
                s.top += dy
                s.bottom -= dy
                sheet.current!.deleteRule(0)
                insertPopRule()
            })
        }
    }, [isPresent])

    return (
        <PopChildMeasure isPresent={isPresent} getElement={getElement} sizeRef={size} pop={pop}>
            {pop === false
                ? children
                : React.cloneElement(children as any, { ref: composedRef })}
        </PopChildMeasure>
    )
}
