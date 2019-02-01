import { MotionValue } from "../value"
import { useCustomValue } from "./use-custom-value"
import { interpolate } from "@popmotion/popcorn"

type TransformerOptions = { clamp: true }

type Transformer = (v: any) => any

const isTransformer = (v: number[] | Transformer): v is Transformer => {
    return typeof v === "function"
}

const noop = () => (v: any) => v

export function useTransformedValue(
    value: MotionValue,
    transform: Transformer
): MotionValue
export function useTransformedValue(
    value: MotionValue<number>,
    from: number[],
    to: any[],
    options?: TransformerOptions
): MotionValue
export function useTransformedValue(
    value: MotionValue,
    transform: Transformer | number[],
    to?: any[],
    opts?: TransformerOptions
): MotionValue {
    let comparitor: any[] = [value]
    let transformer = noop

    if (isTransformer(transform)) {
        transformer = () => transform
    } else if (Array.isArray(to)) {
        const from = transform
        transformer = () => interpolate(from, to, opts)
        comparitor = [value, from.join(","), to.join(",")]
    }

    return useCustomValue(value, transformer, comparitor)
}
