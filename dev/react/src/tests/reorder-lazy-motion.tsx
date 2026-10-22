import { domMax, LazyMotion } from "framer-motion"
import { Reorder } from "framer-motion/m"
import { useState } from "react"

/**
 * #2232: Reorder from the `m` entry, getting its features from a strict
 * LazyMotion. With ?features=async they load when window.loadFeatures() is
 * called, so the test can check the list is inert until then.
 */
const asyncFeatures = new Promise<typeof domMax>((resolve) => {
    ;(window as any).loadFeatures = () => resolve(domMax)
})

export const App = () => {
    const params = new URLSearchParams(window.location.search)
    const [items, setItems] = useState(["a", "b", "c"])

    return (
        <LazyMotion
            strict
            features={
                params.get("features") === "async"
                    ? () => asyncFeatures
                    : domMax
            }
        >
            <Reorder.Group
                axis="y"
                values={items}
                onReorder={setItems}
                style={{ listStyle: "none", margin: 0, padding: 0 }}
            >
                {items.map((item) => (
                    <Reorder.Item
                        key={item}
                        value={item}
                        id={item}
                        style={{
                            height: 50,
                            width: 200,
                            marginBottom: 10,
                            background: "red",
                        }}
                    >
                        {item}
                    </Reorder.Item>
                ))}
            </Reorder.Group>
        </LazyMotion>
    )
}
