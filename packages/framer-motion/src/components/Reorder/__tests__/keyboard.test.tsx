import { fireEvent } from "@testing-library/react"
import { act, useState } from "react"
import { Reorder } from ".."
import { render } from "../../../jest.setup"
import { ReorderAxis } from "../types"

const List = ({
    initial = ["a", "b", "c"],
    axis = "y",
    keyboard = true,
    onReorder,
    onKeyDown,
    dir,
}: {
    initial?: string[]
    axis?: ReorderAxis
    keyboard?: boolean
    onReorder?: (values: string[]) => void
    onKeyDown?: (event: React.KeyboardEvent) => void
    dir?: "rtl"
}) => {
    const [items, setItems] = useState(initial)

    return (
        <Reorder.Group
            axis={axis}
            keyboard={keyboard}
            values={items}
            style={dir ? { direction: dir } : undefined}
            onReorder={(newOrder) => {
                onReorder?.(newOrder)
                setItems(newOrder)
            }}
        >
            {items.map((item) => (
                <Reorder.Item
                    key={item}
                    value={item}
                    data-testid={item}
                    onKeyDown={onKeyDown}
                >
                    {item}
                    <input data-testid={`${item}-input`} />
                </Reorder.Item>
            ))}
        </Reorder.Group>
    )
}

const order = (container: HTMLElement) =>
    Array.from(container.querySelectorAll("li")).map(
        (li) => li.getAttribute("data-testid")
    )

const press = (element: Element, key: string) => {
    act(() => {
        fireEvent.keyDown(element, { key })
    })
}

describe("Reorder keyboard", () => {
    it("makes items focusable when keyboard is set", () => {
        const { getByTestId } = render(<List />)
        expect(getByTestId("a").tabIndex).toBe(0)
    })

    it("lets items override tabIndex", () => {
        const { container } = render(
            <Reorder.Group keyboard values={["a"]} onReorder={() => {}}>
                <Reorder.Item value="a" tabIndex={-1} />
            </Reorder.Group>
        )
        expect(container.querySelector("li")!.tabIndex).toBe(-1)
    })

    it("doesn't change items without keyboard", () => {
        const onReorder = jest.fn()
        const { getByTestId } = render(
            <List keyboard={false} onReorder={onReorder} />
        )
        const a = getByTestId("a")
        expect(a.hasAttribute("tabindex")).toBe(false)

        a.tabIndex = 0
        a.focus()
        press(a, "ArrowDown")
        expect(onReorder).not.toBeCalled()
    })

    it("moves the focused item with the arrow keys on the y axis", () => {
        const onReorder = jest.fn()
        const { container, getByTestId } = render(
            <List onReorder={onReorder} />
        )

        press(getByTestId("a"), "ArrowDown")
        expect(onReorder).toHaveBeenLastCalledWith(["b", "a", "c"])
        expect(order(container)).toEqual(["b", "a", "c"])

        press(getByTestId("a"), "ArrowDown")
        expect(order(container)).toEqual(["b", "c", "a"])

        press(getByTestId("a"), "ArrowUp")
        expect(order(container)).toEqual(["b", "a", "c"])
    })

    it("ignores arrows across the axis and other keys", () => {
        const onReorder = jest.fn()
        const { getByTestId } = render(<List onReorder={onReorder} />)
        const b = getByTestId("b")

        for (const key of ["ArrowLeft", "ArrowRight", "Enter", " ", "a"]) {
            press(b, key)
        }
        expect(onReorder).not.toBeCalled()
    })

    it("does nothing past either end", () => {
        const onReorder = jest.fn()
        const { getByTestId } = render(<List onReorder={onReorder} />)

        press(getByTestId("a"), "ArrowUp")
        press(getByTestId("c"), "ArrowDown")
        expect(onReorder).not.toBeCalled()
    })

    it("prevents the arrow's default scroll only when it reorders", () => {
        const { getByTestId } = render(<List />)

        expect(
            fireEvent.keyDown(getByTestId("a"), { key: "ArrowDown" })
        ).toBe(false)
        expect(fireEvent.keyDown(getByTestId("c"), { key: "ArrowLeft" })).toBe(
            true
        )
    })

    it("moves the focused item with left and right on the x axis", () => {
        const { container, getByTestId } = render(<List axis="x" />)

        press(getByTestId("a"), "ArrowRight")
        expect(order(container)).toEqual(["b", "a", "c"])

        press(getByTestId("a"), "ArrowDown")
        expect(order(container)).toEqual(["b", "a", "c"])

        press(getByTestId("a"), "ArrowLeft")
        expect(order(container)).toEqual(["a", "b", "c"])
    })

    it("flips left and right in RTL", () => {
        const { container, getByTestId } = render(<List axis="x" dir="rtl" />)

        press(getByTestId("a"), "ArrowLeft")
        expect(order(container)).toEqual(["b", "a", "c"])
    })

    it("accepts every arrow on the xy axis", () => {
        const { container, getByTestId } = render(<List axis="xy" />)

        press(getByTestId("a"), "ArrowRight")
        expect(order(container)).toEqual(["b", "a", "c"])
        press(getByTestId("a"), "ArrowDown")
        expect(order(container)).toEqual(["b", "c", "a"])
        press(getByTestId("a"), "ArrowUp")
        expect(order(container)).toEqual(["b", "a", "c"])
        press(getByTestId("a"), "ArrowLeft")
        expect(order(container)).toEqual(["a", "b", "c"])
    })

    it("ignores keys from inside the item", () => {
        const onReorder = jest.fn()
        const { getByTestId } = render(<List onReorder={onReorder} />)

        press(getByTestId("a-input"), "ArrowDown")
        expect(onReorder).not.toBeCalled()
    })

    it("lets the item's onKeyDown prevent reordering", () => {
        const onReorder = jest.fn()
        const onKeyDown = jest.fn((event: React.KeyboardEvent) =>
            event.preventDefault()
        )
        const { getByTestId } = render(
            <List onReorder={onReorder} onKeyDown={onKeyDown} />
        )

        press(getByTestId("a"), "ArrowDown")
        expect(onKeyDown).toBeCalledTimes(1)
        expect(onReorder).not.toBeCalled()
    })

    it("keeps focus on the moved item", () => {
        const { getByTestId } = render(<List />)
        const b = getByTestId("b")

        act(() => b.focus())
        press(b, "ArrowUp")
        expect(document.activeElement).toBe(b)

        press(b, "ArrowDown")
        press(b, "ArrowDown")
        expect(document.activeElement).toBe(b)
    })

    it("skips and keeps unrendered values in place", () => {
        const onReorder = jest.fn()
        const { getByTestId } = render(
            <Reorder.Group
                keyboard
                values={["a", "hidden", "b"]}
                onReorder={onReorder}
            >
                <Reorder.Item value="a" data-testid="a" />
                <Reorder.Item value="b" data-testid="b" />
            </Reorder.Group>
        )

        press(getByTestId("a"), "ArrowDown")
        // As with drag, "a" and "b" swap slots and "hidden" keeps its own
        expect(onReorder).toBeCalledWith(["b", "hidden", "a"])
    })
})
