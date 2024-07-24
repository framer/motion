import { motion } from "framer-motion"

const styleA = {
    width: 300,
    height: 300,
    background: "blue",
}
const styleB = {
    width: 100,
    height: 100,
    background: "red",
}

export const App = () => {
    return (
        <motion.div drag style={styleA}>
            <motion.div drag style={styleB} />
        </motion.div>
    )
}
