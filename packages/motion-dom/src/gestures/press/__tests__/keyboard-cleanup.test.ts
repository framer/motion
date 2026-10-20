import { press } from "../index"
import { enableKeyboardPress } from "../utils/keyboard"

jest.mock("../utils/keyboard", () => {
    const actual = jest.requireActual("../utils/keyboard")
    return { enableKeyboardPress: jest.fn(actual.enableKeyboardPress) }
})

test("cancelling press removes its focus listener", () => {
    const element = document.createElement("button")
    document.body.appendChild(element)
    const cancel = press(element, () => {})

    element.dispatchEvent(new FocusEvent("focus"))
    element.dispatchEvent(new FocusEvent("blur"))
    expect(enableKeyboardPress).toHaveBeenCalledTimes(1)

    cancel()
    element.dispatchEvent(new FocusEvent("focus"))
    expect(enableKeyboardPress).toHaveBeenCalledTimes(1)

    element.remove()
})
