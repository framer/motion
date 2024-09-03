import { MotionConfig, AnimatePresence } from "framer-motion"

export default function Page() {
    return (
        <MotionConfig>
            <AnimatePresence>
                <div id="test">Hello World</div>
            </AnimatePresence>
        </MotionConfig>
    )
}
