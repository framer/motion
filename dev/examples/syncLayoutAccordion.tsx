/**
 * TODO: This demo shows an outstanding use-case for layout transitions where we'd like to animate children of `AnimatePresence`
 * out by popping them out of the layout immediately, but making it look like they're in the same place
 * visually. This might be accomplished with a `popFromLayout` prop or similar that `AnimatePresence`
 * can apply when animating a child out.
 */

import { motion, AnimatePresence } from "@framer"
import * as React from "react"
import { useState } from "react"
import { UnstableSyncLayout } from "../../src/components/SyncLayout"
import { useInvertedScale, useTransform } from "@framer"
import { mix } from "@popmotion/popcorn"

const Accordion = ({ i, expanded, setExpanded }) => {
    const isOpen = i === expanded

    // By using `AnimatePresence` to mount and unmount the contents, we can animate
    // them in and out while also only rendering the contents of open accordions
    return (
        <>
            <motion.header
                initial={false}
                animate={{ backgroundColor: isOpen ? "#FF0088" : "#0055FF" }}
                onClick={() => setExpanded(isOpen ? false : i)}
                layoutTransition
            />
            <motion.section layoutTransition style={{ position: "relative" }}>
                <AnimatePresence>
                    {isOpen && <ContentPlaceholder />}
                </AnimatePresence>
            </motion.section>
        </>
    )
}

export const App = () => {
    // This approach is if you only want max one section open at a time. If you want multiple
    // sections to potentially be open simultaneously, they can all be given their own `useState`.
    const [expanded, setExpanded] = useState<false | number>(0)

    return (
        <div className="example-container">
            <UnstableSyncLayout>
                {[0, 1, 2, 3].map(i => (
                    <Accordion
                        i={i}
                        expanded={expanded}
                        setExpanded={setExpanded}
                    />
                ))}
            </UnstableSyncLayout>
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
const generateParagraphLength = () => randomInt(5, 20)
const generateWordLength = () => randomInt(20, 100)

// Randomly generate some paragraphs of word lengths
const paragraphs = Array(3)
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

export const ContentPlaceholder = () => {
    const { scaleY } = useInvertedScale()
    return (
        <motion.div
            style={{ scaleY, originY: 0 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="content-placeholder"
        >
            {paragraphs.map(words => (
                <Paragraph words={words} />
            ))}
        </motion.div>
    )
}
