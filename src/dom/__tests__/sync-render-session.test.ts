import "../../../jest.setup"
import { syncRenderSession } from "../sync-render-session"
import { VisualElement } from "../../render/VisualElement"

class StubVisualElement extends VisualElement {
    getBoundingBox() {
        return { x: { min: 0, max: 0 }, y: { min: 0, max: 0 } }
    }

    readNativeValue() {
        return 0
    }

    build() {}

    render = () => {
        this.element.v = this.latest.v
    }
}

test("correctly executes render session", () => {
    const stub = { v: 0 }

    const visualElement = new StubVisualElement()

    visualElement.ref(stub)

    visualElement.setStaticValues({ v: 1 })
    expect(stub.v).toBe(0)
    visualElement.render()
    expect(stub.v).toBe(1)

    syncRenderSession.open()
    syncRenderSession.push(visualElement)

    visualElement.setStaticValues({ v: 2 })
    expect(stub.v).toBe(1)
    syncRenderSession.flush()
    expect(stub.v).toBe(2)

    syncRenderSession.open()
    syncRenderSession.flush()
    expect(stub.v).toBe(2)
})
