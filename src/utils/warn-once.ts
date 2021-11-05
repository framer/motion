import { warning } from "hey-listen"

const warned = new Set<string>()
export function warnOnce(condition: boolean, message: string) {
    if (condition || warned.has(message)) return

    warning(condition, message)
    warned.add(message)
}
