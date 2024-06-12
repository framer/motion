const fs = require("fs")
const path = require("path")

function collect(sourceDir, outputFile) {
    const files = fs
        .readdirSync(path.join(__dirname, "../html/public/", sourceDir))
        .filter((f) => path.extname(f) === ".html" && !f.includes(".skip."))

    fs.writeFile(
        path.join(
            __dirname,
            `../../packages/framer-motion/cypress/fixtures/${outputFile}.json`
        ),
        JSON.stringify(files),
        "utf8",
        (err) => {
            if (err) {
                return console.error("Fail to collect HTML tests:", err.message)
            }

            console.log("HTML tests collected!")
        }
    )
}

collect("optimized-appear", "appear-tests")
collect("projection", "projection-tests")
