import * as React from "react"
import { useState, useEffect } from "react"
import { useAnimate, stagger } from "framer-motion"

export function Menu() {
    return (
        <nav className="menu">
            <ul>
                <li>Portfolio</li>
                <li>About</li>
                <li>Contact</li>
                <li>Search</li>
            </ul>
        </nav>
    )
}

const Path = (props) => (
    <path
        fill="transparent"
        strokeWidth="3"
        stroke="var(--background)"
        strokeLinecap="round"
        {...props}
    />
)

export const MenuToggle = ({ toggle }: any) => (
    <button onClick={toggle}>
        <svg width="23" height="18" viewBox="0 0 23 18">
            <Path
                d="M 2 2.5 L 20 2.5"
                variants={{
                    closed: { d: "M 2 2.5 L 20 2.5" },
                    open: { d: "M 3 16.5 L 17 2.5" },
                }}
            />
            <Path d="M 2 9.423 L 20 9.423" className="middle-path" />
            <Path
                d="M 2 16.346 L 20 16.346"
                variants={{
                    closed: { d: "M 2 16.346 L 20 16.346" },
                    open: { d: "M 3 2.5 L 17 16.346" },
                }}
            />
        </svg>
    </button>
)

function useMenuAnimation(isOpen: boolean) {
    const [scope, animate] = useAnimate()

    useEffect(() => {
        animate([
            // ["path.top-path", { d: "M 3 16.5 L 17 2.5" }, { at: "<" }],
            ["path.middle-path", { opacity: 0 }, { at: "<" }],
            // ["path.bottom-path", { d: "M 3 2.5 L 17 16.346" }, { at: "<" }],
            // ["nav", { transform: "translateX(0%)" }],
            // [
            //     "li",
            //     { transform: "translateX(0px)", opacity: 1 },
            //     { delay: stagger(0.2), at: "-0.1" },
            // ],
        ])
    }, [isOpen])

    return scope
}

export function App() {
    const [isOpen, setIsOpen] = useState(false)

    const scope = useMenuAnimation(isOpen)

    return (
        <div ref={scope}>
            <Menu />
            <MenuToggle toggle={() => setIsOpen(!isOpen)} />
        </div>
    )
}
