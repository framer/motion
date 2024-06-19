import { motion } from "framer-motion"

const style = {
    width: 100,
    height: 100,
    background: "white",
}

export const App = () => {
    return <motion.div style={style} animate={{ x: 100 }} />
}
