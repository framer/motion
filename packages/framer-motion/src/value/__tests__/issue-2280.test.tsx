import { useEffect } from "react"
import { frame, MotionValue } from "../../"
import { render } from "../../jest.setup"
import { useMotionValue } from "../use-motion-value"
import { useTransform } from "../use-transform"

async function nextFrame() {
    return new Promise<void>((resolve) => frame.postRender(() => resolve()))
}

test("#2280 combined useTransform reflects chained transform updates", async () => {
    let a!: MotionValue<number>
    let aQuarter!: MotionValue<number>
    let result!: MotionValue<number>
    const seen: number[][] = []

    const Component = ({ onReady }: { onReady: () => void }) => {
        a = useMotionValue(0)
        const aHalf = useTransform(a, (v: number) => v / 2)
        aQuarter = useTransform(aHalf, (h: number) => h / 2)
        result = useTransform([a, aQuarter], ([av, q]: number[]) => {
            seen.push([av, q])
            return av + q
        })
        useEffect(onReady, [])
        return null
    }

    await new Promise<void>((resolve) => {
        render(<Component onReady={resolve} />)
    })
    await nextFrame()

    a.set(100)
    await nextFrame()

    expect(aQuarter.get()).toBe(25)
    expect(result.get()).toBe(125)
    expect(seen[seen.length - 1]).toEqual([100, 25])
})
