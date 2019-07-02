import { motion, AnimatePresence, useCycle } from "@framer"
import * as React from "react"

const style = {
    position: "absolute",
    width: 1280,
    height: 720,
}

const images = [
    "https://d33wubrfki0l68.cloudfront.net/dd23708ebc4053551bb33e18b7174e73b6e1710b/dea24/static/images/wallpapers/shared-colors@2x.png",
    "https://d33wubrfki0l68.cloudfront.net/49de349d12db851952c5556f3c637ca772745316/cfc56/static/images/wallpapers/bridge-02@2x.png",
    "https://d33wubrfki0l68.cloudfront.net/594de66469079c21fc54c14db0591305a1198dd6/3f4b1/static/images/wallpapers/bridge-01@2x.png",
]

export const App = () => {
    const [image, cycleImage] = useCycle(...images)

    return (
        <>
            <style>{`body { overflow: hidden }`}</style>
            <AnimatePresence initial={false}>
                <motion.img
                    src={image}
                    key={image}
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -300, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={style}
                    onClick={cycleImage}
                />
            </AnimatePresence>
        </>
    )
}
