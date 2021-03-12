import { createCrossfader } from "../crossfader"
import { visualElement } from "../../../../render"
import { axisBox } from "../../../../utils/geometry"
import { ResolvedValues } from "../../../../render/types"

type MockInstance = (values: ResolvedValues) => void

interface MockState {
    latest: ResolvedValues
}

const createRenderState = () => ({ latest: {} })

const mockVisualElement = visualElement<MockInstance, MockState, {}>({
    treeType: "mock",
    build(_element, renderState, valuesToRender) {
        renderState.latest = valuesToRender
    },
    makeTargetAnimatable(_element, target) {
        return target
    },
    measureViewportBox() {
        return axisBox()
    },
    readValueFromInstance() {
        return 0
    },
    resetTransform() {},
    restoreTransform() {},
    render(instance, state) {
        instance(state.latest)
    },
    removeValueFromRenderState() {},
    scrapeMotionValuesFromProps(props) {
        return props.style as ResolvedValues
    },
})

function makeVisualState(latestValues: any) {
    return {
        latestValues,
        renderState: createRenderState(),
    }
}

describe("crossfader", () => {
    test("Correctly crossfades from follow to lead", async () => {
        const crossfader = createCrossfader()

        const leadValues = {
            borderRadius: 40,
            backgroundColor: "#fff",
        }
        const lead = mockVisualElement({
            visualState: makeVisualState(leadValues),
            props: {
                initial: leadValues,
            },
        })

        const followValues = {
            borderTopLeftRadius: 20,
            backgroundColor: "#000",
        }
        const follow = mockVisualElement({
            visualState: makeVisualState(followValues),
            props: {
                initial: followValues,
            },
        })

        const third = mockVisualElement({
            props: {},
            visualState: makeVisualState({}),
        })

        let latestLeadValues: ResolvedValues = {}
        let latestFollowValues: ResolvedValues = {}

        lead.mount((latest: ResolvedValues) => {
            latestLeadValues = latest
        })
        follow.mount((latest: ResolvedValues) => (latestFollowValues = latest))

        crossfader.setOptions({ lead, follow })
        lead.setCrossfader(crossfader)
        follow.setCrossfader(crossfader)

        crossfader.toLead({
            duration: 1000,
            ease: () => 0.25,
        })

        return new Promise<void>((resolve) => {
            setTimeout(() => {
                expect(crossfader.isActive()).toBe(true)
                expect(crossfader.getCrossfadeState(lead)).toEqual(
                    latestLeadValues
                )
                expect(crossfader.getCrossfadeState(follow)).toEqual(
                    latestFollowValues
                )
                expect(crossfader.getCrossfadeState(third)).toBeUndefined()

                expect(latestLeadValues.borderTopLeftRadius).toBe(25)
                expect(latestFollowValues.borderTopLeftRadius).toBe(25)
                expect(latestLeadValues.borderBottomRightRadius).toBe(10)
                expect(latestFollowValues.borderBottomRightRadius).toBe(10)

                /**
                 * Don't crossfade background color if there's a following element
                 */
                expect(latestLeadValues.backgroundColor).toBe("#fff")
                expect(latestFollowValues.backgroundColor).toBe("#000")

                /**
                 * Don't crossfade opacity unless requested
                 */
                expect(latestLeadValues.opacity).toBeUndefined()
                expect(latestFollowValues.opacity).toBeUndefined()
                crossfader.stop()
                resolve()
            }, 50)
        })
    })

    test("Correctly only crossfades defined borderRadius", async () => {
        const crossfader = createCrossfader()

        const leadValues = {
            borderTopLeftRadius: 40,
            backgroundColor: "#fff",
        }
        const lead = mockVisualElement({
            visualState: makeVisualState(leadValues),
            props: {
                initial: leadValues,
            },
        })

        const followValues = {
            borderTopLeftRadius: 20,
            backgroundColor: "#000",
        }
        const follow = mockVisualElement({
            visualState: makeVisualState(followValues),
            props: {
                initial: followValues,
            },
        })

        let latestLeadValues: ResolvedValues = {}
        let latestFollowValues: ResolvedValues = {}

        lead.mount((latest: ResolvedValues) => {
            latestLeadValues = latest
        })
        follow.mount((latest: ResolvedValues) => (latestFollowValues = latest))

        crossfader.setOptions({ lead, follow })
        lead.setCrossfader(crossfader)
        follow.setCrossfader(crossfader)

        crossfader.toLead({
            duration: 1000,
            ease: () => 0.25,
        })

        return new Promise<void>((resolve) => {
            setTimeout(() => {
                expect(latestLeadValues.borderTopLeftRadius).toBe(25)
                expect(latestFollowValues.borderTopLeftRadius).toBe(25)
                expect(latestLeadValues.borderBottomRightRadius).toBeUndefined()
                expect(
                    latestFollowValues.borderBottomRightRadius
                ).toBeUndefined()
                crossfader.stop()
                resolve()
            }, 50)
        })
    })

    test("Correctly crossfades from follow to lead with opacity", async () => {
        const crossfader = createCrossfader()

        const leadValues = { backgroundColor: "red", opacity: 0.4 }
        const lead = mockVisualElement({
            visualState: makeVisualState(leadValues),
            props: {
                initial: leadValues,
            },
        })

        const followValues = { backgroundColor: "green", opacity: 1 }
        const follow = mockVisualElement({
            visualState: makeVisualState(followValues),
            props: {
                initial: followValues,
            },
        })

        let latestLeadValues: ResolvedValues = {}
        let latestFollowValues: ResolvedValues = {}

        lead.mount((latest: ResolvedValues) => {
            latestLeadValues = latest
        })
        follow.mount((latest: ResolvedValues) => (latestFollowValues = latest))

        crossfader.setOptions({ lead, follow, crossfadeOpacity: true })
        lead.setCrossfader(crossfader)
        follow.setCrossfader(crossfader)

        crossfader.toLead({
            duration: 1000,
            ease: () => 0.25,
        })

        return new Promise<void>((resolve) => {
            setTimeout(() => {
                expect(latestLeadValues.opacity).toBe(0.3464101615137755)
                expect(latestFollowValues.opacity).toBe(1)
                crossfader.stop()
                resolve()
            }, 50)
        })
    })
    test("Correctly preserves follow opacity", async () => {
        const crossfader = createCrossfader()

        const leadValues = { opacity: 0.4 }
        const lead = mockVisualElement({
            visualState: makeVisualState(leadValues),
            props: {
                initial: leadValues,
            },
        })

        const followValues = {
            opacity: 1,
        }
        const follow = mockVisualElement({
            visualState: makeVisualState(followValues),
            props: {
                initial: followValues,
            },
        })

        let latestLeadValues: ResolvedValues = {}
        let latestFollowValues: ResolvedValues = {}

        lead.mount((latest: ResolvedValues) => {
            latestLeadValues = latest
        })
        follow.mount((latest: ResolvedValues) => (latestFollowValues = latest))

        crossfader.setOptions({
            lead,
            follow,
            crossfadeOpacity: true,
            preserveFollowOpacity: true,
        })
        lead.setCrossfader(crossfader)
        follow.setCrossfader(crossfader)

        crossfader.toLead({
            duration: 1000,
            ease: () => 0.25,
        })

        return new Promise<void>((resolve) => {
            setTimeout(() => {
                expect(latestLeadValues.opacity).toBe(0.3464101615137755)
                expect(latestFollowValues.opacity).toBe(1)
                crossfader.stop()
                resolve()
            }, 50)
        })
    })

    test("Correctly crossfades from snapshot to lead", async () => {
        const crossfader = createCrossfader()

        const leadValues = {
            borderRadius: 40,
            backgroundColor: "#fff",
            opacity: 1,
        }
        const lead = mockVisualElement({
            visualState: makeVisualState(leadValues),
            props: {
                initial: leadValues,
            },
        })

        let latestLeadValues: ResolvedValues = {}

        lead.mount((latest: ResolvedValues) => {
            latestLeadValues = latest
        })

        crossfader.setOptions({
            lead,
            prevValues: {
                borderTopLeftRadius: 20,
                backgroundColor: "#000",
                opacity: 0.4,
            },
        })
        lead.setCrossfader(crossfader)

        crossfader.toLead({
            duration: 1000,
            ease: () => 0.25,
        })

        return new Promise<void>((resolve) => {
            setTimeout(() => {
                expect(latestLeadValues.borderTopLeftRadius).toBe(25)
                expect(latestLeadValues.borderBottomRightRadius).toBe(10)
                expect(latestLeadValues.backgroundColor).toBe(
                    "rgba(128, 128, 128, 1)"
                )
                expect(latestLeadValues.opacity).toBe(0.55)
                crossfader.stop()
                resolve()
            }, 50)
        })
    })
})
