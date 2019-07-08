import { motion, AnimatePresence } from "@framer"
import * as React from "react"
import { useState } from "react"

const variants = {
    enter: (delta: number) => ({ x: delta < 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (delta: number) => ({ x: delta < 0 ? 300 : -300, opacity: 0 }),
}

export const App = () => {
    const [count, setCount] = useState(0)
    const [delta, setDelta] = useState(0)
    const imageIndex = count % images.length

    const paginate = (d: number) => {
        setCount(count + d)
        setDelta(d)
    }

    return (
        <div className="example-container">
            <AnimatePresence initial={false} custom={delta}>
                <motion.img
                    key={count}
                    src={images[imageIndex]}
                    custom={delta}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={1}
                    transition={{
                        x: { type: "spring", stiffness: 300, damping: 200 },
                        opacity: { duration: 0.2 },
                    }}
                    onDragEnd={(e, { offset, velocity }) => {
                        if (offset.x <= -200 || velocity.x <= -10) paginate(-1)
                        if (offset.x >= 200 || velocity.x >= 10) paginate(1)
                    }}
                    onClick={() => paginate(1)}
                />
            </AnimatePresence>
            <motion.div className="next" onClick={() => paginate(1)}>
                {">"}
            </motion.div>
            <motion.div className="prev" onClick={() => paginate(-1)}>
                {"<"}
            </motion.div>
            <style>{`
.example-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.next,
.prev {
  top: 50%;
  position: absolute;
  background: white;
  border-radius: 30px;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
  cursor: pointer;
  font-weight: bold;
  font-size: 18px;
}

.next {
  right: 10px;
}

.prev {
  left: 10px;
}

img {
  position: absolute;
  max-width: 100vw;
}

.refresh {
  padding: 10px;
  position: absolute;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 10px;
  width: 20px;
  height: 20px;
  top: 10px;
  right: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
`}</style>
        </div>
    )
}

const images = [
    "https://d33wubrfki0l68.cloudfront.net/dd23708ebc4053551bb33e18b7174e73b6e1710b/dea24/static/images/wallpapers/shared-colors@2x.png",
    "https://d33wubrfki0l68.cloudfront.net/49de349d12db851952c5556f3c637ca772745316/cfc56/static/images/wallpapers/bridge-02@2x.png",
    "https://d33wubrfki0l68.cloudfront.net/594de66469079c21fc54c14db0591305a1198dd6/3f4b1/static/images/wallpapers/bridge-01@2x.png",
]
