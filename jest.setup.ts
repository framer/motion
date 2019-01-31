import "jest-dom/extend-expect"
// Get fireEvent from the native testing library
// because react-testing-library one switches out mouseEnter and mouseLeave
import { fireEvent } from "dom-testing-library"
export const { mouseEnter, mouseLeave } = fireEvent
import "react-testing-library/cleanup-after-each"
