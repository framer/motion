import { invariant } from "hey-listen"

interface View {
    render: () => void
}

let session: View[] | null = null

export const syncRenderSession = {
    isOpen: () => session !== null,
    open: () => {
        invariant(!session, "Sync render session already open")
        session = []
    },
    flush: () => {
        invariant(session !== null, "No sync render session found")
        session && session.forEach(view => view.render())
        session = null
    },
    push: (view: View) => {
        invariant(session !== null, "No sync render session found")
        session && session.push(view)
    },
}
