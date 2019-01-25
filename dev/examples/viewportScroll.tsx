import * as React from "react"
import { Fragment } from "react"
import styled from "styled-components"
import { useViewportScrollValues, useTransformedValue } from "@framer"
import { motion } from "../../src"

const Container = styled.div`
    margin: 100px auto;
    max-width: 600px;
    padding: 30px;
    background-color: white;
    color: #333;
`

export const Content = () => {
    return (
        <Container>
            <h1>Scroll this page</h1>

            <p>
                They're using our own satellites against us. And the clock is
                ticking. Just my luck, no ice. Life finds a way. Just my luck,
                no ice. Hey, take a look at the earthlings. Goodbye! We gotta
                burn the rain forest, dump toxic waste, pollute the air, and rip
                up the OZONE! 'Cause maybe if we screw up this planet enough,
                they won't want it anymore!
            </p>

            <p>
                They're using our own satellites against us. And the clock is
                ticking. Is this my espresso machine? Wh-what is-h-how did you
                get my espresso machine? Yeah, but John, if The Pirates of the
                Caribbean breaks down, the pirates don’t eat the tourists. Must
                go faster.
            </p>

            <p>
                Hey, take a look at the earthlings. Goodbye! You really think
                you can fly that thing? So you two dig up, dig up dinosaurs?
                Hey, take a look at the earthlings. Goodbye! Yes, Yes, without
                the oops! Is this my espresso machine? Wh-what is-h-how did you
                get my espresso machine?
            </p>

            <p>
                You're a very talented young man, with your own clever thoughts
                and ideas. Do you need a manager? Life finds a way. We gotta
                burn the rain forest, dump toxic waste, pollute the air, and rip
                up the OZONE! 'Cause maybe if we screw up this planet enough,
                they won't want it anymore!
            </p>

            <p>
                Must go faster. Do you have any idea how long it takes those
                cups to decompose. Life finds a way. Must go faster. Did he just
                throw my cat out of the window? Must go faster... go, go, go,
                go, go! I was part of something special. Remind me to thank John
                for a lovely weekend.
            </p>

            <p>
                God creates dinosaurs. God destroys dinosaurs. God creates Man.
                Man destroys God. Man creates Dinosaurs. You're a very talented
                young man, with your own clever thoughts and ideas. Do you need
                a manager? You really think you can fly that thing? Forget the
                fat lady! You're obsessed with the fat lady! Drive us out of
                here!
            </p>

            <p>
                Must go faster... go, go, go, go, go! You're a very talented
                young man, with your own clever thoughts and ideas. Do you need
                a manager? Hey, you know how I'm, like, always trying to save
                the planet? Here's my chance. My dad once told me, laugh and the
                world laughs with you, Cry, and I'll give you something to cry
                about you little bastard!
            </p>

            <p>
                You really think you can fly that thing? They're using our own
                satellites against us. And the clock is ticking. Jaguar shark!
                So tell me - does it really exist? Must go faster... go, go, go,
                go, go! My dad once told me, laugh and the world laughs with
                you, Cry, and I'll give you something to cry about you little
                bastard!
            </p>

            <p>
                You know what? It is beets. I've crashed into a beet truck. Must
                go faster. Yeah, but John, if The Pirates of the Caribbean
                breaks down, the pirates don’t eat the tourists. Yes, Yes,
                without the oops! They're using our own satellites against us.
                And the clock is ticking.
            </p>

            <p>
                Yeah, but your scientists were so preoccupied with whether or
                not they could, they didn't stop to think if they should. My dad
                once told me, laugh and the world laughs with you, Cry, and I'll
                give you something to cry about you little bastard! Forget the
                fat lady! You're obsessed with the fat lady! Drive us out of
                here!
            </p>

            <p>
                What do they got in there? King Kong? Hey, you know how I'm,
                like, always trying to save the planet? Here's my chance. You
                really think you can fly that thing? They're using our own
                satellites against us. And the clock is ticking. Yes, Yes,
                without the oops!
            </p>

            <p>
                Hey, take a look at the earthlings. Goodbye! Must go faster. So
                you two dig up, dig up dinosaurs? Just my luck, no ice. Do you
                have any idea how long it takes those cups to decompose. Jaguar
                shark! So tell me - does it really exist? Yeah, but John, if The
                Pirates of the Caribbean breaks down, the pirates don’t eat the
                tourists.
            </p>

            <p>
                Forget the fat lady! You're obsessed with the fat lady! Drive us
                out of here! You really think you can fly that thing? Hey, you
                know how I'm, like, always trying to save the planet? Here's my
                chance. Life finds a way. Hey, you know how I'm, like, always
                trying to save the planet? Here's my chance.
            </p>

            <p>
                Remind me to thank John for a lovely weekend. Life finds a way.
                I gave it a cold? I gave it a virus. A computer virus. Is this
                my espresso machine? Wh-what is-h-how did you get my espresso
                machine? Must go faster. Life finds a way. My dad once told me,
                laugh and the world laughs with you, Cry, and I'll give you
                something to cry about you little bastard!
            </p>

            <p>
                Eventually, you do plan to have dinosaurs on your dinosaur tour,
                right? You're a very talented young man, with your own clever
                thoughts and ideas. Do you need a manager? Jaguar shark! So tell
                me - does it really exist? Do you have any idea how long it
                takes those cups to decompose.
            </p>

            <p>
                Checkmate... Remind me to thank John for a lovely weekend. Yeah,
                but John, if The Pirates of the Caribbean breaks down, the
                pirates don’t eat the tourists. Is this my espresso machine?
                Wh-what is-h-how did you get my espresso machine? You know what?
                It is beets. I've crashed into a beet truck.
            </p>

            <p>
                This thing comes fully loaded. AM/FM radio, reclining bucket
                seats, and... power windows. So you two dig up, dig up
                dinosaurs? God help us, we're in the hands of engineers. You
                know what? It is beets. I've crashed into a beet truck. We gotta
                burn the rain forest, dump toxic waste, pollute the air, and rip
                up the OZONE! 'Cause maybe if we screw up this planet enough,
                they won't want it anymore!
            </p>

            <p>
                Life finds a way. God creates dinosaurs. God destroys dinosaurs.
                God creates Man. Man destroys God. Man creates Dinosaurs. Hey,
                take a look at the earthlings. Goodbye! Do you have any idea how
                long it takes those cups to decompose. Yes, Yes, without the
                oops!
            </p>

            <p>
                What do they got in there? King Kong? So you two dig up, dig up
                dinosaurs? So you two dig up, dig up dinosaurs? Is this my
                espresso machine? Wh-what is-h-how did you get my espresso
                machine? Life finds a way. Jaguar shark! So tell me - does it
                really exist?
            </p>

            <p>
                Hey, you know how I'm, like, always trying to save the planet?
                Here's my chance. Yeah, but your scientists were so preoccupied
                with whether or not they could, they didn't stop to think if
                they should. Just my luck, no ice. I gave it a cold? I gave it a
                virus. A computer virus.
            </p>
        </Container>
    )
}

const containerStyle: React.CSSProperties = {
    position: "fixed",
    top: 50,
    left: 0,
    right: 0,
    height: 30,
    zIndex: 0,
}

const progressStyle = {
    height: 30,
    width: "100%",
    background: "white",
    transformOrigin: "0 0",
}

const ProgressBar = () => {
    const { scrollYProgress } = useViewportScrollValues()
    const scaleX = useTransformedValue(scrollYProgress, [0, 1], [0, 1])

    return (
        <div style={containerStyle}>
            <motion.div style={{ ...progressStyle, scaleX }} />
        </div>
    )
}

export const App = () => {
    return (
        <Fragment>
            <ProgressBar />
            <Content />
        </Fragment>
    )
}
