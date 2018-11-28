import { useRef, useEffect, MutableRefObject, RefObject } from "react"
import { invariant } from "hey-listen"
import { getTransition } from "../utils/transitions"
import { resolvePoses } from "../utils/pose-resolvers"
import { resolveCurrent, resolveVelocity } from "../utils/resolve-values"
import { MotionValue } from "../motion-value"
import { checkForNewValues } from "../utils/create-value"
import { PoseConfig, MotionProps, PoseResolver, Pose, MotionValueMap } from "../motion/types"
import { useSubsequentRenderEffect } from "../hooks/use-subsequent-render-effect"
import { transformPose } from "../dom/unit-type-conversion"
import { complex } from "style-value-types"

type PoseSubscriber = (v: string | string[]) => void

const isAnimatable = (value: string | number) => typeof value === "number" || complex.test(value)

const isPoseResolver = (pose: Pose | PoseResolver): pose is PoseResolver => typeof pose === "function"

const createPoseResolver = (
    values: MotionValueMap,
    config: PoseConfig,
    { onPoseComplete, ...props }: MotionProps,
    ref: RefObject<Element>
) => {
    const poseResolver = (poseList: string[]) => {
        const poseTransitions: Promise<any>[] = []
        const animating = new Set<string>()

        poseList.reverse().forEach(poseKey => {
            if (poseKey === "default" && config[poseKey] === undefined) {
                return
            }
            invariant(config[poseKey] !== undefined, `Pose with name ${poseKey} not found.`)

            const poseDefinition = config[poseKey]
            let pose: Pose = isPoseResolver(poseDefinition)
                ? poseDefinition(props, resolveCurrent(values), resolveVelocity(values))
                : poseDefinition

            checkForNewValues(pose, values, ref)

            // This feels like a good candidate to inject a transform function via
            // a `PluginContext`, or perhaps a factory function, that can take a pose,
            // maybe run side-effects (ie DOM measurement), and return a new one
            // We may need a second `checkForNewValues` after this if we open it up in case
            // new values are created.
            pose = transformPose(pose, values, ref)

            const { transition, transitionEnd, ...remainingPoseValues } = pose
            let thisPose = remainingPoseValues

            const valueTransitions: Promise<any>[] = []

            Object.keys(thisPose).forEach(valueKey => {
                if (animating.has(valueKey)) return
                animating.add(valueKey)

                const target = thisPose[valueKey]

                const value: MotionValue = values.get(valueKey) as MotionValue

                if (isAnimatable(target)) {
                    // If we can animate this value, for instance 100, '100px' or '#fff'
                    const [action, opts] = getTransition(valueKey, target, transition)

                    if (value) {
                        valueTransitions.push(value.control(action, opts))
                    }
                } else {
                    // If this is not an animatable value, for instance `display: block`, just set it.
                    value.set(target)
                }
            })

            poseTransitions.push(
                Promise.all(valueTransitions).then(() => {
                    if (!transitionEnd) return

                    Object.keys(transitionEnd).forEach(valueKey => {
                        if (values.has(valueKey)) {
                            ;(values.get(valueKey) as MotionValue).set(transitionEnd[valueKey])
                        }
                    })
                })
            )
        })

        return Promise.all(poseTransitions).then(() => {
            onPoseComplete && onPoseComplete(resolveCurrent(values), resolveVelocity(values))
        })
    }

    return poseResolver
}

export const usePoseResolver = (
    values: Map<string, MotionValue>,
    config: PoseConfig,
    props: MotionProps,
    ref: RefObject<Element>
) => {
    const poseSubscriber: MutableRefObject<null | PoseSubscriber> = useRef(null)
    const { pose } = props
    const poseIsSubscription = pose instanceof MotionValue
    const poseResolver = createPoseResolver(values, config, props, ref)

    // If we're controlled by props, fire resolver with latest pose
    const poseList = !poseIsSubscription ? resolvePoses(pose as string | string[]) : []

    useSubsequentRenderEffect(() => {
        if (!poseIsSubscription) poseResolver(poseList)
    }, poseList)

    // Or if we're using a pose subscription, manage subscriptions
    useEffect(() => {
        if (!poseIsSubscription) return

        poseSubscriber.current = (v: string | string[]) => poseResolver(resolvePoses(v))
        ;(pose as MotionValue).addSubscriber(poseSubscriber.current)

        return () => {
            if (poseSubscriber.current) {
                ;(pose as MotionValue).removeSubscriber(poseSubscriber.current)
            }
        }
    }, [])
}
