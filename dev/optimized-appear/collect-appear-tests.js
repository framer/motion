const fs = require("fs")
const path = require("path")

const files = fs
    .readdirSync(__dirname)
    .filter((f) => path.extname(f) === ".html" && !f.includes(".skip."))

fs.writeFile(
    "../../packages/framer-motion/cypress/fixtures/appear-tests.json",
    JSON.stringify(files),
    "utf8",
    (err) => {
        if (err) {
            return console.error("Fail to collect appear tests:", err.message)
        }

        console.log("Appear tests collected!")
    }
)
