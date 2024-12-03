import fs from "fs"
import path from "path"

const packagePath = path.join(
    process.cwd(),
    "packages/framer-motion/package.json"
)
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"))

if (!pkg.bundlesize) {
    console.log("No bundlesize configuration found")
    process.exit(0)
}

let hasFailures = false

pkg.bundlesize.forEach(async ({ path: filePath, maxSize }) => {
    const fullPath = path.join(
        process.cwd(),
        "packages/framer-motion",
        filePath
    )

    if (!fs.existsSync(fullPath)) {
        console.error(`❌ File not found: ${filePath}`)
        hasFailures = true
        return
    }

    // Create gzipped version of file
    const fileContent = fs.readFileSync(fullPath)
    const gzipped = await import("zlib").then((zlib) => {
        return new Promise((resolve, reject) => {
            zlib.gzip(fileContent, (error, result) => {
                if (error) reject(error)
                else resolve(result)
            })
        })
    })

    const gzippedSize = gzipped.length
    const maxBytes = parseFloat(maxSize) * 1024
    const gzippedSizeKb = (gzippedSize / 1024).toFixed(2)

    if (gzippedSize > maxBytes) {
        console.error(
            `❌ ${filePath} is ${gzippedSizeKb} kB (${maxSize} allowed)`
        )
        hasFailures = true
    } else {
        console.log(
            `✅ ${filePath} is ${gzippedSizeKb} kB (${maxSize} allowed)`
        )
    }
})

if (hasFailures) {
    process.exit(1)
}
