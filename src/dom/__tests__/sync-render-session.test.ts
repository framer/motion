import "../../../jest.setup"
import { createStylerFactory } from "stylefire"
import { syncRenderSession } from "../sync-render-session"

test("correctly executes render session", () => {
    let v = 0
    const numberStyler = createStylerFactory({
        onRead: () => 0,
        onRender: state => (v += state.v as number),
    })

    const styler = numberStyler()
    styler.set({ v: 1 })
    expect(v).toBe(0)
    styler.render()
    expect(v).toBe(1)

    syncRenderSession.open()
    syncRenderSession.push(styler)
    styler.set({ v: 2 })
    expect(v).toBe(1)
    syncRenderSession.flush()
    expect(v).toBe(3)

    syncRenderSession.open()
    syncRenderSession.flush()
    expect(v).toBe(3)

    syncRenderSession.open()
    syncRenderSession.push(styler)
    styler.set({ v: 3 })
    expect(v).toBe(3)
    syncRenderSession.flush()
    expect(v).toBe(6)
})
