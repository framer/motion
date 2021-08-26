import { render } from "@testing-library/react"
import * as React from "react"
import { LayoutGroup } from "../index"
import { LayoutGroupContext } from "../../../context/LayoutGroupContext"

const Consumer = ({ id = "1" }: any) => {
    const value = React.useContext(LayoutGroupContext)
    return <div data-testid={id}>{value.id}</div>
}
it("if it's the first LayoutGroup it sets the group id", () => {
    const tree = (
        <LayoutGroup id={"a"}>
            <Consumer />
        </LayoutGroup>
    )

    const { getByTestId } = render(tree)

    expect(getByTestId("1").textContent).toBe("a")
})

it("if it's a nested LayoutGroup it appends to the group id", () => {
    const tree = (
        <LayoutGroup id={"a"}>
            <LayoutGroup id={"b"}>
                <Consumer />
            </LayoutGroup>
        </LayoutGroup>
    )

    const { getByTestId } = render(tree)

    expect(getByTestId("1").textContent).toBe("a-b")
})

it("if it's a nested LayoutGroup it takes the inner most group id if inheritId is false", () => {
    const tree = (
        <LayoutGroup id={"a"}>
            <LayoutGroup id={"b"} inheritId={false}>
                <Consumer />
            </LayoutGroup>
        </LayoutGroup>
    )

    const { getByTestId } = render(tree)

    expect(getByTestId("1").textContent).toBe("b")
})

it("if the value of id is undefined, it doesn't change the group id", () => {
    const tree = (
        <LayoutGroup id={"a"}>
            <LayoutGroup id={undefined}>
                <Consumer />
            </LayoutGroup>
        </LayoutGroup>
    )

    const { getByTestId } = render(tree)

    expect(getByTestId("1").textContent).toBe("a")
})

it("if the parent group id is undefined, child LayoutGroups still append the group id", () => {
    const tree = (
        <LayoutGroup id={"a"}>
            <LayoutGroup id={undefined}>
                <LayoutGroup id={"b"}>
                    <Consumer />
                </LayoutGroup>
            </LayoutGroup>
        </LayoutGroup>
    )

    const { getByTestId } = render(tree)

    expect(getByTestId("1").textContent).toBe("a-b")
})
