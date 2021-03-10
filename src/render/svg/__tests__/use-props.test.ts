import { renderHook } from "@testing-library/react-hooks"
import { useSVGProps } from "../use-props"

describe("SVG useProps", () => {
    test("should return correct styles for element", () => {
        const { result } = renderHook(() =>
            useSVGProps(
                {
                    attrX: 1,
                    attrY: 5,
                    cx: 2,
                    style: {
                        x: 3,
                        scale: 4,
                    },
                } as any,
                {
                    attrX: 6,
                    cx: 7,
                    x: 8,
                    scale: 9,
                }
            )
        )

        expect(result.current).toStrictEqual({
            x: 6,
            cx: 7,
            style: {
                transform: "translateX(8px) scale(9)",
                transformOrigin: "0px 0px",
            },
        })
    })
})
