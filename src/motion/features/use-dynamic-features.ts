import { useState, useEffect } from "react"
import { MotionFeature } from "./types"
import { invariant } from "hey-listen"

type DefaultModuleResponse = {
    default: MotionFeature[]
}

/**
 *
 */
export function useDynamicFeatures(
    importFeatures: () => Promise<DefaultModuleResponse>
) {
    const [features, setFeatures] = useState<MotionFeature[]>([])

    useEffect(() => {
        importFeatures().then(res => {
            invariant(
                Array.isArray(res.default),
                "The default export of the imported file must be an array of MotionFeatures"
            )

            setFeatures(res.default)
        })
    }, [])

    return features
}
