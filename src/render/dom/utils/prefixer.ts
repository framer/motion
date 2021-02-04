import { camelToDash } from "./camel-to-dash"

const camelCache = new Map<string, string>()
const dashCache = new Map<string, string>()
const prefixes: string[] = ["webkit", "woz", "o", "ms"]
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
const testPrefix = (key: string, testElement: HTMLElement) => {
    let isNativelySupported = false
    let prefixedPropertyName = key

    // Natively Supported CSS property
    if (key in testElement.style) {
        isNativelySupported = true
    }

    for (let i = 0; i < numPrefixes; i++) {
        const prefix = prefixes[i]
        const latestPropertyName =
            prefix + key.charAt(0).toUpperCase() + key.slice(1)
        if (latestPropertyName in testElement.style) {
            prefixedPropertyName = latestPropertyName
            break
        }
    }

    // Vendor prefixed properties has priority over natively supported
    if (prefixedPropertyName !== key) {
        camelCache.set(key, prefixedPropertyName)
        setDashPrefix(key, `-${camelToDash(prefixedPropertyName)}`)
    } else if (isNativelySupported) {
        camelCache.set(key, key)
        setDashPrefix(key, `${camelToDash(key)}`)
    }
}

const setServerProperty = (key: string) => setDashPrefix(key, key)

const prefixer = (
    key: string,
    asDashCase: boolean = false,
    element?: HTMLElement
) => {
    const cache = asDashCase ? dashCache : camelCache

    if (!cache.has(key)) {
        if (isBrowser) {
            if (!element) {
                if (!testElement) testElement = document.createElement("div")
                element = testElement
            }
            testPrefix(key, element)
        } else {
            setServerProperty(key)
        }
    }

    return cache.get(key) || key
}

export default prefixer
