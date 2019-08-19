import "jest-dom/extend-expect"
// Get fireEvent from the native testing library
// because @testing-library/react one switches out mouseEnter and mouseLeave
import { fireEvent } from "@testing-library/dom"
export const { mouseEnter, mouseLeave } = fireEvent
import "@testing-library/react/cleanup-after-each"
