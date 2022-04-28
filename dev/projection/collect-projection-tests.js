const fs = require("fs")
const path = require("path")

const files = fs
    .readdirSync(__dirname)
    .filter((f) => path.extname(f) === ".html")

fs.writeFile(
    "../../packages/framer-motion/cypress/fixtures/projection-tests.json",
    JSON.stringify(files),
    "utf8",
    (err) => {
        if (err) {
            return console.error(
                "Fail to collect projection tests:",
                err.message
            )
        }

        console.log("Projection tests collected!")
    }
)
