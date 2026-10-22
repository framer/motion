import { frameData, Reorder } from "framer-motion"
import { useEffect, useState } from "react"

/**
 * A page-scrolling Reorder.Group (no overflow container), from #3944.
 * Records the speed, in pixels per millisecond, of every window.scrollBy()
 * auto-scroll makes in window.scrollCalls. Auto-scroll runs inside a frame
 * and scales by its delta (#3955).
 */
const initialItems = Array.from({ length: 40 }, (_, i) => i)

export const App = () => {
    const [items, setItems] = useState(initialItems)

    useEffect(() => {
        const calls: number[] = ((window as any).scrollCalls = [])
        const scrollBy = window.scrollBy
        window.scrollBy = function (this: Window, ...args: any[]) {
            const [options] = args
            const top =
                typeof options === "object" ? options.top ?? 0 : args[1]
            frameData.delta && calls.push(top / frameData.delta)
            return (scrollBy as any).apply(this, args)
        } as typeof window.scrollBy
        return () => {
            window.scrollBy = scrollBy
        }
    }, [])

    return (
        <>
            <Reorder.Group axis="y" onReorder={setItems} values={items}>
                {items.map((item) => (
                    <Reorder.Item
                        key={item}
                        value={item}
                        id={`item-${item}`}
                        style={{
                            backgroundColor: `hsl(${item * 9}, 70%, 50%)`,
                        }}
                    >
                        Item {item}
                    </Reorder.Item>
                ))}
            </Reorder.Group>
            <style>{styles}</style>
        </>
    )
}

const styles = `
body {
    margin: 0;
}

ul,
li {
    list-style: none;
    padding: 0;
    margin: 0;
}

ul {
    position: relative;
    width: 300px;
}

li {
    height: 50px;
    margin-bottom: 10px;
    border-radius: 5px;
    position: relative;
}
`
