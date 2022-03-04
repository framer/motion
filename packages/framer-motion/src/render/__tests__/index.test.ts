import {createVisualElementAndAnimationState} from './create-element-util'

describe("Unmount handling", () => {
    test("Initial animation", () => {
        const { element } = createVisualElementAndAnimationState()
        const motionValue = {
            stop: jest.fn(),
            get() {return 42},
            set() {},
            onChange(){ return () => 42},
            onRenderRequest(){ return () => 42},
        }
        element.addValue('some-key', motionValue as any)

        element.notifyUnmount();

        expect(motionValue.stop.mock.calls.length).toEqual(1)
    })
})
