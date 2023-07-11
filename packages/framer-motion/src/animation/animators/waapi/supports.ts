// TODO Make memo()
export function createFeatureTest(test: () => boolean) {
    let result: boolean | undefined = undefined
    return () => {
        if (result === undefined) result = test()
        return result
    }
}
