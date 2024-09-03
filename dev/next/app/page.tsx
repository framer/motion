// import { motion, m } from "framer-motion/client"
import { AnimatePresence, Reorder } from "framer-motion"
import * as motion from "framer-motion/client"

export default function Page() {
    return (
        <AnimatePresence>
            <motion.div id="test" />
            {/* <m.li id="test" /> */}
        </AnimatePresence>
    )
}
