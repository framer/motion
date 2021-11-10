import { warning } from "hey-listen"

const warned = new Set<string>()
export function warnOnce(condition: () => boolean, message: string) {
    if (warned.has(message)) return

    const resolvedCondition = condition()
    warning(resolvedCondition, message)
    if (!resolvedCondition) warned.add(message)
}
