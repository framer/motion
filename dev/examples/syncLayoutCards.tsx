import { motion, AnimatePresence, useInvertedScale } from "@framer"
import * as React from "react"
import { useState } from "react"
import { mix } from "@popmotion/popcorn"

const container = { boxSizing: "border-box", width: 400, margin: "0 auto" }

const cardContainer = {
    height: 300,
    margin: 50,
}

const card = {
    background: "white",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
}

const openCard = {
    ...card,
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
}

const closedCard = {
    ...card,
    width: "100%",
    height: "100%",
}

const closeButtonContainer = {
    top: 0,
    right: 0,
    position: "absolute",
    originX: 1,
    originY: 0,
    padding: 10,
}

const closeButton = {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "red",
}

const textContainer = {
    top: 0,
    left: 0,
    position: "absolute",
    originX: 0,
    originY: 0,
    padding: 10,
    width: 250,
}

const image = {
    position: "absolute",
    top: 0,
    left: "50%",
    transform: "translateX(-50%)",
    originX: 0.5,
    originY: 0,
    height: 400,
}

const CloseButton = () => {
    const inverted = useInvertedScale()
    return (
        <motion.div style={{ ...closeButtonContainer, ...inverted }}>
            <div style={closeButton} />
        </motion.div>
    )
}

const Text = () => {
    const inverted = useInvertedScale()

    return (
        <motion.div style={{ ...textContainer, ...inverted }}>
            <HeaderPlaceholder />
        </motion.div>
    )
}

const BackgroundImage = () => {
    const inverted = useInvertedScale()

    return (
        <motion.img
            style={{ ...image, ...inverted }}
            transformTemplate={(_, gen) => `translateX(-50%) ${gen}`}
            src="https://images.squarespace-cdn.com/content/v1/5b475b2c50a54f54f9b4e1dc/1531633791866-D46FRSW11M4MEIZXDQY8/ke17ZwdGBToddI8pDm48kHH9S2ID7_bpupQnTdrPcoF7gQa3H78H3Y0txjaiv_0fDoOvxcdMmMKkDsyUqMSsMWxHk725yiiHCCLfrh8O1z4YTzHvnKhyp6Da-NYroOW3ZGjoBKy3azqku80C789l0nQwvinDXPV4EYh2MRzm-RRB5rUELEv7EY2n0AZOrEupxpSyqbqKSgmzcCPWV5WMiQ/DSCF2803.jpg?format=2500w"
        />
    )
}

const Content = () => {
    const inverted = useInvertedScale()

    return (
        <motion.div
            style={{
                paddingTop: 300,
                width: 500,
                originX: 0.5,
                originY: 0,
                ...inverted,
            }}
        >
            <ContentPlaceholder />
        </motion.div>
    )
}

const Card = () => {
    const [isOpen, setOpen] = useState(false)
    const transition = { duration: 0.6 }
    const cardStyle = isOpen ? openCard : closedCard
    const animate = isOpen
        ? {
              zIndex: 2,
              transition,
          }
        : {
              zIndex: 2,
              transition,
              transitionEnd: { zIndex: 0 },
          }

    return (
        <div style={cardContainer}>
            <motion.div
                layoutTransition
                initial={false}
                animate={animate}
                style={{ ...cardStyle }}
                onClick={() => setOpen(!isOpen)}
            >
                <BackgroundImage />
                <Text />
                <Content />
                <CloseButton />
            </motion.div>
        </div>
    )
}

export const App = () => {
    return (
        <div style={container}>
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
            <style>{styles}</style>
        </div>
    )
}

const styles = `body {
    background-repeat: no-repeat;
    padding: 0;
    margin: 0;
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    }
    
    .example-container {
    width: 320px;
    padding: 20px;
    position: fixed;
    top: 0
    }
    
    .content-placeholder {
    padding: 20px;
    transform-origin: top center;
    }
    
    header {
    background: #0055ff;
    border-radius: 10px;
    color: white;
    cursor: pointer;
    height: 40px;
    margin-bottom: 20px;
    }
    
    .word {
    height: 18px;
    border-radius: 10px;
    display: inline-block;
    margin-bottom: 8px;
    margin-right: 8px;
    background: #0055ff;
    border-radius: 10px;
    display: inline-block;
    }
    
    .paragraph {
    margin-bottom: 20px;
    }
    
    @media (max-width: 600px) {
    .content-placeholder {
      padding-left: 20px;
    }
    
    .header .word {
      height: 30px;
    }
    
    .word {
      height: 14px;
      margin-bottom: 5px;
      margin-right: 5px;
    }
    
    .paragraph {
      margin-bottom: 20px;
    }
    }`
const randomInt = (min, max) => Math.round(mix(min, max, Math.random()))
const generateParagraphLength = () => randomInt(5, 7)
const generateWordLength = () => randomInt(20, 100)

// Randomly generate some paragraphs of word lengths
const header = Array(1)
    .fill(1)
    .map(() => {
        return Array(generateParagraphLength())
            .fill(1)
            .map(generateWordLength)
    })
const paragraphs = Array(10)
    .fill(1)
    .map(() => {
        return Array(generateParagraphLength())
            .fill(1)
            .map(generateWordLength)
    })

export const Word = ({ width }) => <div className="word" style={{ width }} />

const Paragraph = ({ words }) => (
    <div className="paragraph">
        {words.map(width => (
            <Word width={width} />
        ))}
    </div>
)

export const HeaderPlaceholder = () => {
    return (
        <div className="content-placeholder">
            {header.map(words => (
                <Paragraph words={words} />
            ))}
        </div>
    )
}
export const ContentPlaceholder = () => {
    return (
        <div className="content-placeholder">
            {paragraphs.map(words => (
                <Paragraph words={words} />
            ))}
        </div>
    )
}
