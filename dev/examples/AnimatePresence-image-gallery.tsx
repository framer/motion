import { motion, AnimatePresence } from "@framer"
import * as React from "react"
import { useState } from "react"
import { wrap } from "popmotion"

/**
 * An example of a single-image, single-child image gallery using AnimatePresence
 */

const variants = {
    enter: (delta: number) => ({
        x: delta > 0 ? 1000 : -1000,
        opacity: 0,
    }),
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1,
    },
    exit: (delta: number) => ({
        zIndex: 0,
        x: delta < 0 ? 1000 : -1000,
        opacity: 0,
    }),
}

const Image = ({ src, paginate, delta }) => (
    <motion.img
        src={src}
        custom={delta}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={1}
        transition={{
            duration: 2,
        }}
        onDragEnd={(e, { offset, velocity }) => {
            const swipe = Math.abs(offset.x) * velocity.x

            if (swipe < -10000) {
                paginate(1)
            } else if (swipe > 10000) {
                paginate(-1)
            }
        }}
    />
)

export const App = () => {
    const [[page, delta], setPage] = useState([0, 0])
    const imageIndex = wrap(0, images.length, page)

    const paginate = (newDelta: number) => {
        setPage([page + newDelta, newDelta])
    }

    return (
        <div className="example-container">
            <AnimatePresence initial={false} custom={delta}>
                <Image
                    delta={delta}
                    paginate={paginate}
                    src={images[imageIndex]}
                    key={page}
                />
            </AnimatePresence>
            <div className="next" onClick={() => paginate(1)}>
                {">"}
            </div>
            <div className="prev" onClick={() => paginate(-1)}>
                {"<"}
            </div>
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
  z-index: 2;
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
