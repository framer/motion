import { CanvasNode, framer } from "framer-plugin"
import { useLocalStorage } from "@uidotdev/usehooks"
import "./App.css"
import { useSelection } from "./hooks/useSelection"
import { useState } from "react"

framer.showUI({
    title: "Stagger Effects",
    position: "top right",
    width: 200,
    height: 250,
})

type StaggerType = "enter" | "exit" | "loop"

const typeFilter = {
    enter: (node: CanvasNode) =>
        "styleAppearEffectEnabled" in node &&
        node.styleAppearEffectEnabled === true &&
        node.enterEffectTransition,
    exit: (node: CanvasNode) =>
        "styleAppearEffectEnabled" in node &&
        node.styleAppearEffectEnabled === true &&
        node.exitEffectTransition,
    loop: (node: CanvasNode) =>
        "loopEffectEnabled" in node &&
        node.loopEffectEnabled === true &&
        node.loopEffectTransition,
} as const

function useTimeoutBoolean(): [boolean, VoidFunction] {
    const [value, setState] = useState(false)

    return [
        value,
        () => {
            setState(true)
            setTimeout(() => setState(false), 1000)
        },
    ]
}

export function App() {
    const selection = useSelection()
    const [delay, setDelay] = useLocalStorage("stagger-delay", 0.2)
    const [baseDelay, setBaseDelay] = useLocalStorage("stagger-base-delay", 0)
    const [type, setEffectType] = useLocalStorage<StaggerType>(
        "stagger-type",
        "enter"
    )
    const [isApplying, setIsApplying] = useTimeoutBoolean()

    const filteredSelection = selection.filter(typeFilter[type])

    return (
        <>
            <fieldset>
                <label>Effect Type</label>
                <select
                    value={type}
                    onChange={(event) =>
                        setEffectType(event.currentTarget.value as StaggerType)
                    }
                >
                    <option value="enter">Enter</option>
                    <option value="exit">Exit</option>
                    <option value="loop">Loop</option>
                </select>
            </fieldset>
            {filteredSelection.length ? (
                <>
                    <fieldset>
                        <label>Delay</label>
                        <input
                            type="number"
                            value={delay}
                            onChange={(event) => {
                                setDelay(parseFloat(event.currentTarget.value))
                            }}
                        />
                    </fieldset>
                    <fieldset>
                        {" "}
                        <label>Base Delay</label>
                        <input
                            type="number"
                            value={baseDelay}
                            onChange={(event) => {
                                setBaseDelay(
                                    parseFloat(event.currentTarget.value)
                                )
                            }}
                        />
                    </fieldset>
                    <button
                        className={isApplying ? "" : "framer-button-primary"}
                        disabled={isApplying}
                        onClick={() => {
                            setIsApplying()
                            const attr = `${type}EffectTransition`
                            for (let i = 0; i < filteredSelection.length; i++) {
                                const node = filteredSelection[i]
                                node.setAttributes({
                                    [attr]: {
                                        ...(node as any)[attr],
                                        delay: baseDelay + delay * i,
                                    },
                                })
                            }
                        }}
                    >
                        {isApplying ? "Applied ✅" : "Apply"}
                    </button>
                </>
            ) : (
                <EmptyState type={type} />
            )}
        </>
    )
}

function EmptyState({ type }: { type: string }) {
    return (
        <p>
            No layers with{" "}
            <span style={{ textTransform: "capitalize" }}>{type}</span> Effects
            selected
        </p>
    )
}
