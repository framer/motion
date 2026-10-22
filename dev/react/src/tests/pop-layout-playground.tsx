import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useLayoutEffect, useRef, useState } from "react"

/**
 * Playground for AnimatePresence mode="popLayout" (#2348): an exiting
 * element should stay where it was when popping it out of the layout moves
 * its container.
 *
 * Every scenario of `issue-2348.tsx` is a control here (and the same URL
 * params), plus harder ones: scroll changing in the same commit as the
 * removal, transformed items and ancestors, adding and removing in one
 * render, rapid removals and nested AnimatePresence with `propagate`.
 *
 * On removal a dashed "ghost" is drawn at the item's rect, in the same
 * scroll context as the item, and the exiting item's centre is tracked
 * against it for the length of the exit.
 */

type Anchor = "top" | "bottom" | "center"
type Ancestor = "" | "scale" | "rotate" | "center"
type SameCommit = "" | "window" | "scroller" | "intoView"
type ItemMotion = "" | "fly" | "wobble"
type Action = "remove" | "toast" | "rapid"

interface Config {
    popLayout: boolean
    fixed: boolean
    anchor: Anchor
    anchorY: "" | "top" | "bottom"
    scroll: boolean
    scroller: boolean
    positioned: boolean
    mirror: boolean
    layoutScroll: boolean
    ancestor: Ancestor
    sameCommit: SameCommit
    itemMotion: ItemMotion
    nested: boolean
    action: Action
}

const base: Config = {
    popLayout: true,
    fixed: false,
    anchor: "top",
    anchorY: "",
    scroll: false,
    scroller: false,
    positioned: false,
    mirror: false,
    layoutScroll: false,
    ancestor: "",
    sameCommit: "",
    itemMotion: "",
    nested: false,
    action: "remove",
}

interface Preset {
    id: string
    group: string
    label: string
    caption: string
    config: Partial<Config>
}

const presets: Preset[] = [
    {
        id: "static",
        group: "Reporter's scenarios",
        label: "Static list (baseline)",
        caption:
            "An in-flow list. Popping the item doesn't move the list, so both builds hold it on the ghost.",
        config: {},
    },
    {
        id: "fixed-top",
        group: "Reporter's scenarios",
        label: "Fixed list, top-anchored",
        caption:
            "The reporter's sandbox. The list's top edge is fixed, so it doesn't move when it shrinks: both builds hold the item on the ghost.",
        config: { fixed: true, anchor: "top" },
    },
    {
        id: "fixed-bottom",
        group: "Reporter's scenarios",
        label: "Fixed list, bottom-anchored (toasts)",
        caption:
            "The bug. The list is pinned to the bottom of the viewport, so when the item pops out the list shrinks and its top moves down. On main the item drops a full row (70px) below its ghost. With the fix it shrinks inside the ghost.",
        config: { fixed: true, anchor: "bottom" },
    },
    {
        id: "fixed-bottom-anchorY",
        group: "Reporter's scenarios",
        label: "Fixed bottom + anchorY=bottom",
        caption:
            "The anchorY=\"bottom\" workaround pins the item to the list's bottom edge, which doesn't move here, so both builds hold the item on the ghost.",
        config: { fixed: true, anchor: "bottom", anchorY: "bottom" },
    },
    {
        id: "fixed-center",
        group: "Reporter's scenarios",
        label: "Fixed, centred with translate(-50%, -50%)",
        caption:
            "The list stays centred as it shrinks, so its top moves down by half a row. On main the item drifts 35px below its ghost. With the fix it stays on the ghost.",
        config: { fixed: true, anchor: "center" },
    },
    {
        id: "scroll-mirror",
        group: "Reporter's scenarios",
        label: "Scrolled page, document shrinks",
        caption:
            "The page is scrolled to the bottom, and removing the item also shrinks the document (mirror rows below the list), so the scroll clamps. The item is page content and moves with it: both builds hold it on the ghost.",
        config: { scroll: true, mirror: true },
    },
    {
        id: "scroller",
        group: "Reporter's scenarios",
        label: "Scroll container, scrolled to the bottom",
        caption:
            "Inside a 300px scroll container (marked layoutScroll) that isn't the offsetParent. On main the popped item is pinned at its unscrolled offset, so it jumps about 1900px down and vanishes from the container. With the fix it moves with the content and stays on its ghost.",
        config: { scroller: true },
    },
    {
        id: "scroller-positioned",
        group: "Reporter's scenarios",
        label: "Positioned scroll container",
        caption:
            "Baseline: the scroll container is the list's offsetParent (position: relative), so the pop offsets are already in scroll space. Both builds hold the item on the ghost.",
        config: { scroller: true, positioned: true },
    },
    {
        id: "scaled-fixed-bottom",
        group: "Reporter's scenarios",
        label: "scale(0.5) ancestor, bottom-anchored list",
        caption:
            'Everything is inside a scale(0.5) wrapper, which is also the containing block of the "fixed" list. On main the item drops 35px on screen. With the fix the move is scaled into the list\'s space and the item stays on the ghost.',
        config: { fixed: true, anchor: "bottom", ancestor: "scale" },
    },
    {
        id: "layout-scroll",
        group: "Reporter's scenarios",
        label: "Fixed bottom + layoutScroll, scrolled page",
        caption:
            "The fixed, bottom-anchored list is marked layoutScroll on a scrolled page. On main the item drops 70px. With the fix it stays on the ghost, because it's fixed and ignores the page scroll.",
        config: {
            fixed: true,
            anchor: "bottom",
            layoutScroll: true,
            scroll: true,
        },
    },
    {
        id: "same-commit-window",
        group: "Harder scenarios",
        label: "Window scrolls in the same commit",
        caption:
            "A useLayoutEffect scrolls the window up 120px in the same commit as the removal. The item is page content, so it moves with the page and its ghost: both builds hold.",
        config: { scroll: true, sameCommit: "window" },
    },
    {
        id: "same-commit-scroller",
        group: "Harder scenarios",
        label: "Scroller scrolls in the same commit",
        caption:
            "A useLayoutEffect scrolls the (non-positioned) scroll container up 120px in the same commit as the removal. On main the item vanishes, pinned at its unscrolled offset. With the fix it moves with the content and its ghost.",
        config: { scroller: true, sameCommit: "scroller" },
    },
    {
        id: "same-commit-into-view",
        group: "Harder scenarios",
        label: "scrollIntoView in the same commit",
        caption:
            "In the same commit, the first remaining item is scrolled into view (block: end) inside the non-positioned scroll container. On main the item vanishes. With the fix it moves with the content and its ghost.",
        config: { scroller: true, sameCommit: "intoView" },
    },
    {
        id: "exit-fly",
        group: "Harder scenarios",
        label: "Exit animates x + rotate (fixed bottom)",
        caption:
            "The exit also flies right 120px and rotates 45\u00b0, so the drift readout includes that 120px. On main the item also drops a row as it flies (139px). With the fix it flies out horizontally from the ghost (120px, all intended).",
        config: { fixed: true, anchor: "bottom", itemMotion: "fly" },
    },
    {
        id: "wobble",
        group: "Harder scenarios",
        label: "Item mid-transform when removed (fixed bottom)",
        caption:
            "Items wobble 40px on x the whole time, so the item is mid-transform when it pops. On main it also drops a row (72px). With the fix it keeps wobbling in the ghost's row (40px, all wobble).",
        config: { fixed: true, anchor: "bottom", itemMotion: "wobble" },
    },
    {
        id: "rotated-ancestor",
        group: "Still wrong with the fix",
        label: "rotate(8deg) ancestor, bottom-anchored list",
        caption:
            "Still off with the fix. The list is pinned to the bottom of a rotate(8deg) box, and the ghost is the item's axis-aligned bounding box. Main drifts up to 70px. The fix measures the move on screen and maps it back without the rotation, so about 24px is left.",
        config: { fixed: true, anchor: "bottom", ancestor: "rotate" },
    },
    {
        id: "translate-centred",
        group: "Harder scenarios",
        label: "Absolutely centred box, translate(-50%, -50%)",
        caption:
            "Not fixed: the list sits in an absolutely positioned box centred with translate(-50%, -50%), which moves as it shrinks. On main the item drifts 35px. With the fix it stays on the ghost.",
        config: { ancestor: "center" },
    },
    {
        id: "toast-queue",
        group: "Harder scenarios",
        label: "Toast queue: add + remove in one render",
        caption:
            "\"Push toast\" removes the oldest toast and adds a new one in the same render, so the list keeps its height and doesn't move. Both builds hold the leaving toast on its ghost, so the fix doesn't over-correct for the half-finished commit.",
        config: { fixed: true, anchor: "bottom", action: "toast" },
    },
    {
        id: "rapid",
        group: "Still wrong with the fix",
        label: "Rapid removals while exits run",
        caption:
            'Still wrong with the fix. "Run" removes the second item three times, 200ms apart. Each item is corrected once, when it pops. Each later removal moves the list again and carries the items still exiting with it: up to about 100px with the fix, about 165px on main. The newest item stays put.',
        config: { fixed: true, anchor: "bottom", action: "rapid" },
    },
    {
        id: "nested-propagate",
        group: "Still wrong with the fix",
        label: "Nested AnimatePresence propagate (known limitation)",
        caption:
            "Known limitation. Each group holds an inner AnimatePresence with propagate, and removing a group pops it while its chips exit too. On main the group drops and its chips drop further. With the fix the group stays on its ghost, but its chips jump up inside it, over the group's label.",
        config: { fixed: true, anchor: "bottom", nested: true },
    },
]

const presetConfig = (p: Preset): Config => ({ ...base, ...p.config })

const boolKeys = [
    "popLayout",
    "fixed",
    "scroll",
    "scroller",
    "positioned",
    "mirror",
    "layoutScroll",
    "nested",
] as const
const stringKeys = [
    "anchor",
    "anchorY",
    "ancestor",
    "sameCommit",
    "itemMotion",
    "action",
] as const

function readConfig(): Config {
    if (typeof window === "undefined") return presetConfig(presets[2])
    const params = new URLSearchParams(window.location.search)
    const known = [...boolKeys, ...stringKeys, "scale"]
    if (!known.some((k) => params.has(k))) return presetConfig(presets[2])
    const config: any = { ...base }
    for (const k of boolKeys) config[k] = params.has(k)
    for (const k of stringKeys) config[k] = params.get(k) ?? base[k]
    if (params.has("scale")) config.ancestor = "scale"
    if (!config.anchor) config.anchor = "top"
    if (!config.action) config.action = "remove"
    return config
}

function writeConfig(config: Config) {
    const params = new URLSearchParams(window.location.search)
    const parts: string[] = []
    params.forEach((v, k) => {
        if (![...boolKeys, ...stringKeys, "scale"].includes(k as any)) {
            parts.push(v ? `${k}=${encodeURIComponent(v)}` : k)
        }
    })
    for (const k of boolKeys) if (config[k]) parts.push(k)
    for (const k of stringKeys) {
        if (config[k] && config[k] !== base[k]) parts.push(`${k}=${config[k]}`)
    }
    if (
        config.fixed &&
        config.anchor === "top" &&
        !parts.includes("anchor=top")
    ) {
        parts.push("anchor=top")
    }
    const search = parts.length ? "?" + parts.join("&") : ""
    window.history.replaceState(null, "", window.location.pathname + search)
}

const sameConfig = (a: Config, b: Config) =>
    (Object.keys(base) as (keyof Config)[]).every((k) => a[k] === b[k])

/**
 * Ghosts
 */
interface Ghost {
    key: string
    label: string
    layer: "fixed" | "doc" | "scroller"
    x: number
    y: number
    width: number
    height: number
    drift: number
}

const exitDuration = 1.2

function layerScale(layer: HTMLElement) {
    const { width, height } = layer.getBoundingClientRect()
    return [width / layer.offsetWidth || 1, height / layer.offsetHeight || 1]
}

/**
 * The element's rect in a ghost layer's coordinate space.
 */
function rectIn(element: Element, layer: HTMLElement) {
    const rect = element.getBoundingClientRect()
    const origin = layer.getBoundingClientRect()
    const [sx, sy] = layerScale(layer)
    return {
        x: (rect.left - origin.left) / sx,
        y: (rect.top - origin.top) / sy,
        width: rect.width / sx,
        height: rect.height / sy,
    }
}

const centre = (r: { x: number; y: number; width: number; height: number }) => [
    r.x + r.width / 2,
    r.y + r.height / 2,
]

/**
 * Items
 */
interface Item {
    id: number
    chips?: number[]
}

const initialItems = (config: Config): Item[] => {
    const count = config.action === "rapid" ? 6 : 4
    return Array.from({ length: count }, (_, id) => ({
        id,
        chips: config.nested ? [id * 10, id * 10 + 1] : undefined,
    }))
}

const fixedStyles: Record<Anchor, React.CSSProperties> = {
    top: { position: "fixed", top: 200, left: "max(200px, 50%)" },
    bottom: { position: "fixed", bottom: 20, right: 20 },
    center: {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
    },
}

function Demo({
    config,
    runRef,
}: {
    config: Config
    runRef: React.MutableRefObject<{ run: () => void; add: () => void }>
}) {
    const count = useRef(config.action === "rapid" ? 6 : 4)
    const [items, setItems] = useState(() => initialItems(config))
    const [ghosts, setGhosts] = useState<Ghost[]>([])
    const [scrollTick, setScrollTick] = useState(0)
    const fixedLayer = useRef<HTMLDivElement>(null)
    const docLayer = useRef<HTMLDivElement>(null)
    const scrollerLayer = useRef<HTMLDivElement>(null)
    const scroller = useRef<HTMLDivElement>(null)
    const timers = useRef<number[]>([])

    const transformedAncestor = !!config.ancestor
    const layerName: Ghost["layer"] =
        config.fixed && !transformedAncestor
            ? "fixed"
            : config.scroller
            ? "scroller"
            : "doc"
    const getLayer = () =>
        ({ fixed: fixedLayer, doc: docLayer, scroller: scrollerLayer }[
            layerName
        ].current!)

    /**
     * Start scrolled to the bottom so the list is in view.
     */
    useLayoutEffect(() => {
        if (config.scroll) window.scrollTo(0, document.body.scrollHeight)
        else window.scrollTo(0, 0)
        if (config.scroller && scroller.current) {
            scroller.current.scrollTop = scroller.current.scrollHeight
        }
        return () => timers.current.forEach(clearTimeout)
    }, [])

    /**
     * Scroll in the same commit as the removal.
     */
    useLayoutEffect(() => {
        if (!scrollTick) return
        if (config.sameCommit === "window") window.scrollBy(0, -120)
        if (config.sameCommit === "scroller" && scroller.current) {
            scroller.current.scrollTop -= 120
        }
        if (config.sameCommit === "intoView") {
            document
                .querySelector("[data-pg-item]:not([data-motion-pop-id])")
                ?.scrollIntoView({ block: "end" })
        }
    }, [scrollTick])

    const recordGhost = (id: number) => {
        const element = document.getElementById(`pg-item-${id}`)
        const layer = getLayer()
        if (!element || !layer) return
        const key = `${id}-${Date.now()}`
        const rect = rectIn(element, layer)
        const [cx, cy] = centre(rect)
        setGhosts((g) => [
            ...g,
            { key, label: String(id + 1), layer: layerName, ...rect, drift: 0 },
        ])

        /**
         * Track the exiting element's centre against the ghost's.
         */
        let max = 0
        const start = performance.now()
        const track = () => {
            const current = document.getElementById(`pg-item-${id}`)
            if (current && layer.isConnected) {
                const [x, y] = centre(rectIn(current, layer))
                max = Math.max(max, Math.hypot(x - cx, y - cy))
            }
            setGhosts((g) =>
                g.map((ghost) =>
                    ghost.key === key
                        ? { ...ghost, drift: Math.round(max) }
                        : ghost
                )
            )
            if (current && performance.now() - start < exitDuration * 1000) {
                requestAnimationFrame(track)
            }
        }
        requestAnimationFrame(track)
        timers.current.push(
            window.setTimeout(
                () => setGhosts((g) => g.filter((ghost) => ghost.key !== key)),
                exitDuration * 1000 + 2500
            )
        )
    }

    const remove = (id: number, add = false) => {
        recordGhost(id)
        setItems((current) => {
            const next = current.filter((item) => item.id !== id)
            if (add) {
                const newId = count.current++
                next.push({
                    id: newId,
                    chips: config.nested ? [newId * 10] : undefined,
                })
            }
            return next
        })
        if (config.sameCommit) setScrollTick((t) => t + 1)
    }

    const removeChip = (itemId: number, chip: number) =>
        setItems((current) =>
            current.map((item) =>
                item.id === itemId
                    ? { ...item, chips: item.chips!.filter((c) => c !== chip) }
                    : item
            )
        )

    const itemsRef = useRef(items)
    itemsRef.current = items
    const target = () => {
        const list = itemsRef.current
        return list[list.length > 1 ? 1 : 0]
    }

    runRef.current = {
        run: () => {
            if (config.action === "toast") {
                const first = itemsRef.current[0]
                if (first) remove(first.id, true)
            } else if (config.action === "rapid") {
                for (let i = 0; i < 3; i++) {
                    timers.current.push(
                        window.setTimeout(() => {
                            const item = target()
                            item && remove(item.id)
                        }, i * 200)
                    )
                }
            } else {
                const item = target()
                item && remove(item.id)
            }
        },
        add: () => {
            const id = count.current++
            setItems((current) => [
                ...current,
                { id, chips: config.nested ? [id * 10] : undefined },
            ])
        },
    }

    const exit =
        config.itemMotion === "fly"
            ? { scale: 0, opacity: 0, x: 120, rotate: 45 }
            : { scale: 0, opacity: 0 }
    const transition = {
        duration: exitDuration,
        ease: "easeInOut",
        opacity: { duration: exitDuration, ease: "easeIn" },
    } as const
    const wobble =
        config.itemMotion === "wobble"
            ? {
                  x: [0, 40],
                  transition: {
                      x: {
                          duration: 0.7,
                          repeat: Infinity,
                          repeatType: "mirror" as const,
                          ease: "easeInOut" as const,
                      },
                  },
              }
            : {}

    const mode = config.popLayout ? "popLayout" : "sync"
    const anchorY = config.anchorY || undefined

    const list = (
        <motion.ul
            className="pg-list"
            style={config.fixed ? fixedStyles[config.anchor] : undefined}
            layoutScroll={config.layoutScroll}
        >
            <AnimatePresence mode={mode} anchorY={anchorY}>
                {items.map((item) => (
                    <motion.li
                        key={item.id}
                        id={`pg-item-${item.id}`}
                        data-pg-item=""
                        className={
                            config.nested ? "pg-item pg-group" : "pg-item"
                        }
                        layout
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1, ...wobble }}
                        exit={exit}
                        transition={transition}
                        onClick={() => remove(item.id)}
                    >
                        <span className="pg-item-label">{item.id + 1}</span>
                        {item.chips && (
                            <div className="pg-chips">
                                <AnimatePresence
                                    mode={mode}
                                    anchorY={anchorY}
                                    propagate
                                >
                                    {item.chips.map((chip) => (
                                        <motion.button
                                            key={chip}
                                            className="pg-chip"
                                            layout
                                            initial={{ scale: 0.6, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0, opacity: 0 }}
                                            transition={transition}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                removeChip(item.id, chip)
                                            }}
                                        >
                                            {item.id + 1}.{(chip % 10) + 1}
                                        </motion.button>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </motion.li>
                ))}
            </AnimatePresence>
        </motion.ul>
    )

    const mirror =
        config.mirror &&
        items.map((item) => (
            <div key={item.id} className="pg-mirror">
                mirror {item.id + 1}
            </div>
        ))

    const spacer = (config.scroll || config.scroller) && (
        <div className="pg-spacer">
            {config.scroller ? "scroll container" : "page"} spacer (2000px)
        </div>
    )

    let content: React.ReactNode = config.scroller ? (
        <motion.div
            id="scroller"
            ref={scroller}
            className="pg-scroller"
            layoutScroll
            style={{ position: config.positioned ? "relative" : undefined }}
        >
            <div ref={scrollerLayer} className="pg-scroller-layer">
                <GhostLayer ghosts={ghosts} layer="scroller" />
            </div>
            {spacer}
            {list}
            {mirror}
        </motion.div>
    ) : (
        <>
            {spacer}
            {list}
            {mirror}
        </>
    )

    if (config.ancestor === "center") {
        content = (
            <div className="pg-centre-frame">
                <div className="pg-centred">{content}</div>
            </div>
        )
    } else if (config.ancestor) {
        content = (
            <div className={`pg-ancestor pg-ancestor-${config.ancestor}`}>
                {content}
            </div>
        )
    }

    return (
        <>
            {content}
            <div ref={docLayer} className="pg-doc-layer">
                <GhostLayer ghosts={ghosts} layer="doc" />
            </div>
            <div ref={fixedLayer} className="pg-fixed-layer">
                <GhostLayer ghosts={ghosts} layer="fixed" />
            </div>
            <DriftReadout ghosts={ghosts} />
        </>
    )
}

function GhostLayer({
    ghosts,
    layer,
}: {
    ghosts: Ghost[]
    layer: Ghost["layer"]
}) {
    return (
        <>
            {ghosts
                .filter((g) => g.layer === layer)
                .map((g) => (
                    <div
                        key={g.key}
                        className="pg-ghost"
                        style={{
                            left: g.x,
                            top: g.y,
                            width: g.width,
                            height: g.height,
                        }}
                    >
                        <span className="pg-ghost-dot" />
                    </div>
                ))}
        </>
    )
}

function DriftReadout({ ghosts }: { ghosts: Ghost[] }) {
    if (!ghosts.length) return null
    return (
        <div className="pg-drift" id="drift">
            {ghosts.map((g) => (
                <div key={g.key} data-drift={g.drift}>
                    item {g.label}: max centre drift{" "}
                    <strong className={g.drift > 3 ? "bad" : "good"}>
                        {g.drift}px
                    </strong>
                </div>
            ))}
        </div>
    )
}

function Radio<T extends string>({
    name,
    value,
    options,
    onChange,
}: {
    name: string
    value: T
    options: [T, string][]
    onChange: (v: T) => void
}) {
    return (
        <fieldset className="pg-radio">
            <legend>{name}</legend>
            {options.map(([v, label]) => (
                <label key={v}>
                    <input
                        type="radio"
                        name={name}
                        checked={value === v}
                        onChange={() => onChange(v)}
                    />
                    {label}
                </label>
            ))}
        </fieldset>
    )
}

export const App = () => {
    const [config, setConfig] = useState(readConfig)
    const [run, setRun] = useState(0)
    const runRef = useRef({ run: () => {}, add: () => {} })

    useEffect(() => writeConfig(config), [config])

    const preset = presets.find((p) => sameConfig(presetConfig(p), config))
    const set = <K extends keyof Config>(key: K, value: Config[K]) =>
        setConfig((c) => ({ ...c, [key]: value }))
    const check = (key: (typeof boolKeys)[number], label: string) => (
        <label className="pg-check">
            <input
                type="checkbox"
                id={`opt-${key}`}
                checked={config[key]}
                onChange={(e) => set(key, e.currentTarget.checked)}
            />
            {label}
        </label>
    )

    const groups = [...new Set(presets.map((p) => p.group))]
    const actionLabel = {
        remove: "Remove item 2",
        toast: "Push toast",
        rapid: "Remove item 2, three times",
    }[config.action]

    return (
        <div className="pg">
            <style>{css}</style>
            <div className="pg-side">
                <div className="pg-actions">
                    <h1>popLayout playground</h1>
                    <button
                        id="run"
                        className="pg-primary"
                        onClick={() => runRef.current.run()}
                    >
                        {actionLabel}
                    </button>
                    <button id="add" onClick={() => runRef.current.add()}>
                        Add
                    </button>
                    <button id="reset" onClick={() => setRun((r) => r + 1)}>
                        Reset
                    </button>
                    <p className="pg-caption" id="caption">
                        {preset
                            ? preset.caption
                            : "Custom combination. Dashed outlines are each removed item's rect at removal. An exiting item should shrink towards the centre of its outline."}
                    </p>
                </div>
                <aside className="pg-controls">
                    <label className="pg-select">
                        Scenario
                        <select
                            id="scenario"
                            value={preset?.id ?? ""}
                            onChange={(e) => {
                                const p = presets.find(
                                    (p) => p.id === e.currentTarget.value
                                )
                                p && setConfig(presetConfig(p))
                            }}
                        >
                            {!preset && <option value="">Custom</option>}
                            {groups.map((group) => (
                                <optgroup key={group} label={group}>
                                    {presets
                                        .filter((p) => p.group === group)
                                        .map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.label}
                                            </option>
                                        ))}
                                </optgroup>
                            ))}
                        </select>
                    </label>
                    <div className="pg-checks">
                        {check("popLayout", 'mode="popLayout"')}
                        {check("fixed", "position: fixed list")}
                        {check("scroll", "scrolled page")}
                        {check("scroller", "scroll container")}
                        {check("positioned", "scroll container positioned")}
                        {check("mirror", "mirror items in the page")}
                        {check("layoutScroll", "layoutScroll on the list")}
                        {check("nested", "nested AnimatePresence propagate")}
                    </div>
                    <Radio
                        name="Fixed anchor"
                        value={config.anchor}
                        options={[
                            ["top", "top"],
                            ["bottom", "bottom"],
                            ["center", "centre"],
                        ]}
                        onChange={(v) => set("anchor", v)}
                    />
                    <Radio
                        name="anchorY prop"
                        value={config.anchorY}
                        options={[
                            ["", "unset"],
                            ["top", "top"],
                            ["bottom", "bottom"],
                        ]}
                        onChange={(v) => set("anchorY", v)}
                    />
                    <Radio
                        name="Transformed ancestor"
                        value={config.ancestor}
                        options={[
                            ["", "none"],
                            ["scale", "scale(0.5)"],
                            ["rotate", "rotate(8deg)"],
                            ["center", "translate(-50%) centred"],
                        ]}
                        onChange={(v) => set("ancestor", v)}
                    />
                    <Radio
                        name="Scroll in the same commit"
                        value={config.sameCommit}
                        options={[
                            ["", "none"],
                            ["window", "window"],
                            ["scroller", "scroll container"],
                            ["intoView", "scrollIntoView"],
                        ]}
                        onChange={(v) => set("sameCommit", v)}
                    />
                    <Radio
                        name="Item motion"
                        value={config.itemMotion}
                        options={[
                            ["", "scale exit"],
                            ["fly", "exit x + rotate"],
                            ["wobble", "wobbling x"],
                        ]}
                        onChange={(v) => set("itemMotion", v)}
                    />
                    <Radio
                        name="Action"
                        value={config.action}
                        options={[
                            ["remove", "remove one"],
                            ["toast", "toast queue"],
                            ["rapid", "rapid ×3"],
                        ]}
                        onChange={(v) => set("action", v)}
                    />
                    <p className="pg-note">
                        Click an item to remove it. The URL tracks these
                        options, so any state can be linked.
                    </p>
                </aside>
            </div>
            <main className="pg-stage">
                <Demo
                    key={JSON.stringify(config) + run}
                    config={config}
                    runRef={runRef}
                />
            </main>
        </div>
    )
}

const css = `
:root {
    --bg: #fafafa;
    --fg: #1b1b1f;
    --muted: #5f6068;
    --panel: #ffffff;
    --border: #d9d9de;
    --accent: #ff0088;
    --chip: #ffd1e8;
    --ghost: #0a7cff;
    --good: #18864b;
    --bad: #c62828;
    color-scheme: light dark;
}
.pg {
    font: 14px/1.45 system-ui, -apple-system, "Segoe UI", sans-serif;
    color: var(--fg);
}
@media (prefers-color-scheme: dark) {
    :root {
        --bg: #141417;
        --fg: #ececf1;
        --muted: #a2a3ad;
        --panel: #1e1e23;
        --border: #34343c;
        --chip: #5c1d3d;
        --ghost: #5aa9ff;
        --good: #4cc982;
        --bad: #ff6b6b;
    }
}
html, body { margin: 0; background: var(--bg); }
body { background: var(--bg); }
.pg * { box-sizing: border-box; }
.pg button, .pg select {
    font: inherit;
    color: var(--fg);
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 6px 10px;
    cursor: pointer;
}
.pg .pg-primary { background: var(--accent); border-color: var(--accent); color: #fff; }
.pg-actions {
    position: sticky;
    top: 0;
    z-index: 20;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding: 10px 16px;
    background: var(--panel);
    border-bottom: 1px solid var(--border);
}
.pg-caption { margin: 2px 0 0; flex-basis: 100%; color: var(--muted); max-width: 70ch; }
.pg-controls { padding: 12px 16px; display: grid; gap: 10px; }
.pg-actions h1 { font-size: 15px; margin: 0 8px 0 0; flex-basis: 100%; }
.pg-select { display: grid; gap: 4px; }
.pg-select select { width: 100%; }
.pg-checks { display: grid; gap: 2px; }
.pg-check, .pg-radio label { display: flex; gap: 6px; align-items: center; }
.pg-radio { border: 1px solid var(--border); border-radius: 6px; margin: 0; padding: 4px 10px 8px; display: flex; flex-wrap: wrap; gap: 2px 12px; }
.pg-radio legend { color: var(--muted); font-size: 12px; }
.pg-note { color: var(--muted); font-size: 12px; margin: 0; }
.pg-stage { position: relative; padding: 16px; min-height: 520px; }
.pg-side { display: contents; }
@media (min-width: 760px) {
    .pg-side {
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        width: 340px;
        display: flex;
        flex-direction: column;
        background: var(--panel);
        border-right: 1px solid var(--border);
        z-index: 10;
    }
    .pg-actions { position: static; flex: none; }
    .pg-controls { flex: 1; overflow: auto; }
    .pg-stage { margin-left: 340px; }
}
.pg-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    list-style: none;
    margin: 0;
    padding: 0;
    width: 150px;
    z-index: 5;
}
.pg-item {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 150px;
    min-height: 60px;
    border-radius: 10px;
    background: var(--accent);
    color: #fff;
    padding: 6px 12px;
    cursor: pointer;
    font-weight: 600;
}
.pg-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.pg-chip { padding: 2px 8px !important; background: var(--chip) !important; border: none !important; font-size: 12px; }
.pg-mirror { height: 70px; color: var(--muted); font-size: 12px; border-top: 1px dashed var(--border); }
.pg-spacer {
    height: 2000px;
    color: var(--muted);
    padding: 8px;
    background: repeating-linear-gradient(180deg, transparent 0 99px, var(--border) 99px 100px);
}
.pg-scroller { height: 300px; overflow: auto; padding: 10px; border: 1px solid var(--border); border-radius: 8px; max-width: 320px; }
.pg-scroller-layer { position: relative; height: 0; }
.pg-ancestor { position: relative; min-height: 520px; border: 1px dashed var(--border); padding: 10px; }
.pg-ancestor-scale { height: 1040px; transform: scale(0.5); transform-origin: 0 0; }
.pg-ancestor-rotate { transform: rotate(8deg); transform-origin: 50% 50%; max-width: 420px; margin: 20px; }
.pg-centre-frame { position: relative; height: 520px; border: 1px dashed var(--border); }
.pg-centred { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }
.pg-doc-layer { position: absolute; top: 0; left: 0; width: 100px; height: 100px; pointer-events: none; z-index: 30; }
.pg-fixed-layer { position: fixed; inset: 0; pointer-events: none; z-index: 30; }
.pg-ghost {
    position: absolute;
    border: 2px dashed var(--ghost);
    border-radius: 10px;
    pointer-events: none;
}
.pg-ghost-dot {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 8px;
    height: 8px;
    margin: -4px 0 0 -4px;
    border-radius: 50%;
    background: var(--ghost);
}
.pg-drift {
    position: fixed;
    left: 16px;
    bottom: 16px;
    z-index: 40;
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 6px 10px;
    font-size: 12px;
    pointer-events: none;
}
@media (min-width: 760px) { .pg-drift { left: 356px; } }
.pg-drift .good { color: var(--good); }
.pg-drift .bad { color: var(--bad); }
`
