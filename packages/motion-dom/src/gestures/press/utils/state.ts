export interface PressState {
    current: null | Element
}

export const pressing: PressState = {
    current: null,
}

export const setPressing = (element: Element | null) => {
    pressing.current = element
}

export const isPressing = (element: Element) => pressing.current === element
