const fs = require("fs")
const path = require("path")

const files = fs
    .readdirSync(path.join(__dirname, "../html/public/optimized-appear"))
    .filter((f) => path.extname(f) === ".html" && !f.includes(".skip."))

fs.writeFile(
    path.join(
        __dirname,
        "../../packages/framer-motion/cypress/fixtures/appear-tests.json"
    ),
    JSON.stringify(files),
    "utf8",
    (err) => {
        if (err) {
            return console.error("Fail to collect appear tests:", err.message)
        }

        console.log("Appear tests collected!")
    }
)
