const featureTests = {
    waapi: () => Object.hasOwnProperty.call(Element.prototype, "animate"),
}

type FeatureTests = Record<keyof typeof featureTests, () => boolean>

const results = {}

export const supports = {} as FeatureTests

/**
 * Generate features tests that cache their results.
 */
for (const key in featureTests) {
    supports[key] = () => {
        if (results[key] === undefined) results[key] = featureTests[key]()
        return results[key]
    }
}
