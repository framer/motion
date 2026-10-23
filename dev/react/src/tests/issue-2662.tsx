import { AnimatePresence, motion } from "framer-motion"
import { useState } from "react"

/**
 * #2662: the reporter's hamburger menu. A menu mounted by AnimatePresence
 * slides down and staggers its links in through variants. Under React 19's
 * StrictMode effect double-invoke (which Next.js dev with experimental.taint
 * pulled in through React's experimental build), framer-motion <= 11.2.10
 * left it stuck on `initial`. The dev app renders in StrictMode.
 *
 * Each frame after the click records the menu's translateY and the last
 * link's opacity into window.frames2662.
 */
const linksVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
    exit: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
}

const linkItemVariants = {
    hidden: { opacity: 0, y: "50%" },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" },
    },
    exit: {
        opacity: 0,
        y: "50%",
        transition: { duration: 0.1, ease: "easeOut" },
    },
} as const

const menuVariants = {
    hidden: { y: "-100vh" },
    visible: { y: 0, transition: { type: "tween", duration: 0.3 } },
    exit: {
        y: "-100vh",
        transition: { type: "tween", duration: 0.3, delay: 0.3 },
    },
} as const

const record = () => {
    const frames: Array<[number, string]> = ((window as any).frames2662 = [])
    const loop = () => {
        const menu = document.getElementById("menu")
        const links = document.querySelectorAll(".link")
        frames.push([
            menu ? new DOMMatrix(getComputedStyle(menu).transform).f : NaN,
            links.length
                ? getComputedStyle(links[links.length - 1]).opacity
                : "",
        ])
        frames.length < 120 && requestAnimationFrame(loop)
    }
    requestAnimationFrame(loop)
}

export const App = () => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <header>
            <button
                id="toggle"
                onClick={() => {
                    record()
                    setIsOpen((prev) => !prev)
                }}
            >
                menu
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.nav
                        id="menu"
                        key="menu"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={menuVariants}
                        style={{
                            position: "fixed",
                            inset: 0,
                            background: "#111",
                            color: "white",
                        }}
                    >
                        <motion.div
                            variants={linksVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            {["Home", "About", "Projects"].map((title) => (
                                <motion.span
                                    key={title}
                                    className="link"
                                    style={{ display: "block" }}
                                    variants={linkItemVariants}
                                >
                                    {title}
                                </motion.span>
                            ))}
                        </motion.div>
                    </motion.nav>
                )}
            </AnimatePresence>
        </header>
    )
}
