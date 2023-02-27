const path = require("path")
const { readFileSync } = require("fs")

const file = readFileSync(
    path.join(__dirname, "../", "dist", "dom-entry.d.ts"),
    "utf8"
)

if (file.includes(`<reference types="react" />`)) {
    throw new Error("DOM bundle includes reference to React")
}
