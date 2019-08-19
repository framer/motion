import { basename, extname } from "path"

export const fileName = (pathName: string): string => {
    return basename(pathName, extname(pathName))
}
