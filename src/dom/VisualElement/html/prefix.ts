import { camelToDash } from "../../../utils/camel-to-dash"

const camelCache = new Map()
const dashCache = new Map()
const prefixes: string[] = ["Webkit", "Moz", "O", "ms", ""]
const numPrefixes = prefixes.length
const isBrowser = typeof document !== "undefined"

let testElement: HTMLElement

const setDashPrefix = (key: string, prefixed: string) =>
    dashCache.set(key, camelToDash(prefixed))

/*
  Test style property for prefixed version

  @param [string]: Style property
  @return [string]: Cached property name
*/
const testPrefix = (key: string) => {
    testElement = testElement || document.createElement("div")

    for (let i = 0; i < numPrefixes; i++) {
        const prefix = prefixes[i]
        const noPrefix = prefix === ""
        const prefixedPropertyName = noPrefix
            ? key
            : prefix + key.charAt(0).toUpperCase() + key.slice(1)

        if (prefixedPropertyName in testElement.style || noPrefix) {
            /**
             * This is a hack to not overwrite a prefixed value with a non-prefixed one
             * as Safari incorrectly reports that it supports `clipPath`. But in most cases we
             * want to use the non-prefixed version.
             */
            if (noPrefix && key === "clipPath" && dashCache.has(key)) {
                return
            }

            camelCache.set(key, prefixedPropertyName)
            setDashPrefix(
                key,
                `${noPrefix ? "" : "-"}${camelToDash(prefixedPropertyName)}`
            )
        }
    }
}

const setServerProperty = (key: string) => setDashPrefix(key, key)

export const prefix = (key: string, asDashCase: boolean = false) => {
    const cache = asDashCase ? dashCache : camelCache

    if (!cache.has(key)) {
        isBrowser ? testPrefix(key) : setServerProperty(key)
    }

    return cache.get(key) || key
}
