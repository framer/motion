export function calcInset(element: Element, container: HTMLElement) {
  let inset = { x: 0, y: 0 }

  let current: Element | null = element
  while (current && current !== container) {
    if (current instanceof HTMLElement) {
      inset.x += current.offsetLeft
      inset.y += current.offsetTop
      current = current.offsetParent
    } else if (current instanceof SVGGraphicsElement && "getBBox" in current) {
      const { top, left } = current.getBBox()
      inset.x += left
      inset.y += top

      /**
       * Assign the next parent element as the <svg /> tag.
       */
      while (current && current.tagName !== "svg") {
        current = current.parentNode as SVGElement
      }
    }
  }

  return inset
}
