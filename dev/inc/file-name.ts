import { basename, extname } from "path-browserify"

export const fileName = (pathName: string): string => {
    return basename(pathName, extname(pathName))
}
