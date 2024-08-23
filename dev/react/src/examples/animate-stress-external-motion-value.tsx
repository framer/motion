import { motion, useMotionValue } from "framer-motion"

function Box({ i }: { i: number }) {
    const rotate = useMotionValue(0)

    return (
        <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            style={{
                rotate,
                background: `hsla(${i * 10}, 100%, 50%, 1)`,
                width: 100,
                height: 100,
            }}
        />
    )
}

export const App = () => {
    const boxes = Array.from(Array(1000).keys()).map((i) => (
        <Box i={i} key={i} />
    ))

    return (
        <div
            style={{
                padding: 100,
                width: "100%",
                display: "flex",
                flexWrap: "wrap",
            }}
        >
            {boxes}
        </div>
    )
}
