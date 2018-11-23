import { useRef, useEffect, MutableRefObject, RefObject } from "react"
import { invariant } from "hey-listen"
import { getTransition } from "../utils/transitions"
import { poseToArray } from "../utils/pose-resolvers"
import { resolveCurrent, resolveVelocity } from "../utils/resolve-values"
import { MotionValue } from "../motion-value"
import { createValuesFromPose, bindValuesToRef } from "../utils/create-value"
import { PoseConfig, MotionProps, PoseResolver, Pose, MotionValueMap } from "../motion/types"
import { useSubsequentRenderEffect } from "../hooks/use-subsequent-render-effect"
import { complex } from "style-value-types"

type PoseSubscriber = (v: string | string[]) => void

const isAnimatable = (value: string | number) => typeof value === "number" || complex.test(value)

const createPoseResolver = (
    values: MotionValueMap,
    config: PoseConfig,
    { onPoseComplete, ...props }: MotionProps,
    ref: RefObject<Element>
) => (poseList: string[]) => {
    const poseTransitions: Promise<any>[] = []

    poseList.reverse().forEach(poseKey => {
        invariant(config[poseKey] !== undefined, `Pose with name ${poseKey} not found.`)

        const pose: Pose =
            typeof config[poseKey] === "function"
                ? (config[poseKey] as PoseResolver)(props, resolveCurrent(values), resolveVelocity(values))
                : (config[poseKey] as Pose)

        const { transition, transitionEnd, ...thisPose } = pose

        const valueTransitions: Promise<any>[] = []

        Object.keys(thisPose).forEach(valueKey => {
            const target = thisPose[valueKey]

            // If this value doesn't exist in the value map, create it
            if (!values.has(valueKey)) {
                createValuesFromPose(values, pose)
                bindValuesToRef(values, ref)
            }

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
    const poseList = !poseIsSubscription ? poseToArray(pose as string | string[]) : []

    useSubsequentRenderEffect(() => {
        if (!poseIsSubscription) poseResolver(poseList)
    }, poseList)

    // Or if we're using a pose subscription, manage subscriptions
    useEffect(() => {
        if (!poseIsSubscription) return

        poseSubscriber.current = (v: string | string[]) => poseResolver(poseToArray(v))
        ;(pose as MotionValue).addSubscriber(poseSubscriber.current)

        return () => {
            if (poseSubscriber.current) {
                ;(pose as MotionValue).removeSubscriber(poseSubscriber.current)
            }
        }
    })
}
