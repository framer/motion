import { invariant } from "hey-listen"
import { Styler } from "stylefire"

let session: Styler[] | null = null

export const syncRenderSession = {
    isOpen: () => session !== null,
    open: () => {
        invariant(!session, "Sync render session already open")
        session = []
    },
    flush: () => {
        invariant(session !== null, "No sync render session found")
        session && session.forEach(styler => styler.render())
        session = null
    },
    push: (styler: Styler) => {
        invariant(session !== null, "No sync render session found")
        session && session.push(styler)
    },
}
