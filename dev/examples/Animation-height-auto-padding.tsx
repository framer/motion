import * as React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "@framer"
import { mix } from "popmotion"

export const App = () => {
    const [isExpanded, setExpanded] = useState(false)

    return (
        <div className="example-container">
            <AnimatePresence>
                {isExpanded ? (
                    <motion.div
                        animate={{
                            height: "auto",
                            opacity: 1,
                            paddingTop: 30,
                            paddingBottom: 30,
                        }}
                        exit={{
                            height: 0,
                            opacity: 0,
                            paddingTop: 0,
                            paddingBottom: 0,
                        }}
                        initial={{
                            height: 0,
                            opacity: 0,
                            paddingTop: 0,
                            paddingBottom: 0,
                        }}
                        style={{ background: "white", width: 200 }}
                    >
                        Test
                    </motion.div>
                ) : null}
            </AnimatePresence>
            <button style={{}} onClick={() => setExpanded(!isExpanded)}>
                Toggle
            </button>
            <style>{styles}</style>
        </div>
    )
}

const styles = `body {
  background: white!important;
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

section {
  overflow: hidden;
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
const generateParagraphLength = () => randomInt(5, 20)
const generateWordLength = () => randomInt(20, 100)

// Randomly generate some paragraphs of word lengths
const paragraphs = Array(3)
    .fill(1)
    .map(() => {
        return Array(generateParagraphLength()).fill(1).map(generateWordLength)
    })

export const Word = ({ width }) => <div className="word" style={{ width }} />

const Paragraph = ({ words }) => (
    <div className="paragraph">
        {words.map((width) => (
            <Word width={width} />
        ))}
    </div>
)

export const ContentPlaceholder = () => (
    <motion.div
        variants={{ collapsed: { scale: 0.8 }, open: { scale: 1 } }}
        transition={{ duration: 0.8 }}
        className="content-placeholder"
    >
        {paragraphs.map((words) => (
            <Paragraph words={words} />
        ))}
    </motion.div>
)
