import { MotionConfig, AnimatePresence } from "framer-motion"
import * as motion from "framer-motion/client"
import * as m from "framer-motion/m"

export default function Page() {
    return (
        <MotionConfig>
            <AnimatePresence>
                <motion.div id="test">Hello World</motion.div>
                <m.div id="m-test">Hello World</m.div>
            </AnimatePresence>
        </MotionConfig>
    )
}
