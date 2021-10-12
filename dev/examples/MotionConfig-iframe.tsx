import * as React from "react"
import * as ReactDOM from "react-dom"
import { MotionConfig } from "@framer"
import { App as UseViewportScrollExample } from "./useViewportScroll"

export const App = () => (
    <Frame>
        <UseViewportScrollExample />
    </Frame>
)

function Frame({ children }) {
    const iframeRef = React.useRef(null)
    const [frame, setFrame] = React.useState<{
        container: HTMLElement
        document: Document
        window: Window
    }>({
        container: null,
        document: null,
        window: null,
    })

    function loadFrame() {
        const document = iframeRef.current.contentDocument
        const container = document.getElementById("app")
        if (container) {
            setFrame({
                container,
                document,
                window: iframeRef.current.contentWindow,
            })
        }
    }

    React.useEffect(loadFrame, [])

    return (
        <>
            <iframe
                ref={iframeRef}
                onLoad={loadFrame}
                srcDoc={`<!DOCTYPE html><html><body><div id='app'>`}
                style={{
                    width: 600,
                    height: 600,
                    border: "none",
                }}
            />
            {frame.container &&
                children &&
                ReactDOM.createPortal(
                    <MotionConfig
                        documentContext={frame.document}
                        windowContext={frame.window}
                    >
                        {children}
                    </MotionConfig>,
                    frame.container
                )}
        </>
    )
}
