import { invariant } from "hey-listen"
import { NativeElement } from "../motion/utils/use-native-element"

let session: NativeElement[] | null = null

export const syncRenderSession = {
    isOpen: () => session !== null,
    open: () => {
        invariant(!session, "Sync render session already open")
        session = []
    },
    flush: () => {
        invariant(session !== null, "No sync render session found")
        session && session.forEach(nativeElement => nativeElement.render())
        session = null
    },
    push: (nativeElement: NativeElement) => {
        invariant(session !== null, "No sync render session found")
        session && session.push(nativeElement)
    },
}
