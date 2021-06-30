import { useConstant } from "../../utils/use-constant"

let id = 1
export function createProjectionId(): number {
    return id++
}

export function useProjectionId(): number {
    return useConstant(createProjectionId)
}
