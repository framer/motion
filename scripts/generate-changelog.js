#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

/**
 * Generate a slug from version number by replacing dots with dashes and removing leading zeros
 * e.g., "12.23.15" -> "12-23-15", "12.23.0" -> "12-23", "12.0.0" -> "12"
 */
function generateSlug(version) {
    // Remove brackets and split by dots
    const cleanVersion = version.replace(/[\[\]]/g, "")
    const parts = cleanVersion.split(".")

    // Remove leading zeros from each part and convert to numbers, then back to strings
    const cleanedParts = parts.map((part) => String(Number(part)))

    // Remove trailing zeros (but keep at least one part)
    while (
        cleanedParts.length > 1 &&
        cleanedParts[cleanedParts.length - 1] === "0"
    ) {
        cleanedParts.pop()
    }

    return cleanedParts.join("-")
}

/**
 * Parse version string to determine if it's major, minor, or patch
 * Based on semantic versioning (x.y.z)
 */
function getVersionType(version) {
    // Remove brackets and split by dots
    const cleanVersion = version.replace(/[\[\]]/g, "")
    const parts = cleanVersion.split(".")

    if (parts.length >= 3) {
        const [major, minor, patch] = parts.map(Number)

        // If this is the first version we're processing, we can't determine the type
        // For now, we'll use a simple heuristic based on the patch number
        if (patch > 0) return "patch"
        if (minor > 0) return "minor"
        return "major"
    }

    return "patch" // Default fallback
}

/**
 * Compare two x.y.z versions. Negative when a is older than b.
 */
function compareVersions(a, b) {
    const left = a
        .replace(/[\[\]]/g, "")
        .split(".")
        .map(Number)
    const right = b
        .replace(/[\[\]]/g, "")
        .split(".")
        .map(Number)
    for (let i = 0; i < 3; i++) {
        if (left[i] !== right[i]) return left[i] - right[i]
    }
    return 0
}

/**
 * The version this repo publishes. Changelog entries newer than this
 * are written ahead of a release and must not reach the site.
 */
function getReleaseVersion() {
    const packagePath = path.join(
        __dirname,
        "..",
        "packages",
        "motion",
        "package.json"
    )
    return JSON.parse(fs.readFileSync(packagePath, "utf8")).version
}

/**
 * Escape CSV field - handle quotes and commas
 */
function escapeCsvField(field) {
    if (field.includes('"') || field.includes(",") || field.includes("\n")) {
        return '"' + field.replace(/"/g, '""') + '"'
    }
    return field
}

/**
 * Parse the changelog and convert to CSV
 */
function parseChangelog() {
    const changelogPath = path.join(__dirname, "..", "CHANGELOG.md")
    const csvPath = path.join(__dirname, "..", "changelog.csv")

    try {
        const content = fs.readFileSync(changelogPath, "utf8")
        const lines = content.split("\n")

        const entries = []
        let currentEntry = null
        let currentContent = []
        let inContentSection = false

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]

            // Check if this is a version header (## [version] date)
            const versionMatch = line.match(/^## \[([^\]]+)\] (.+)$/)
            if (versionMatch) {
                // Save previous entry if exists
                if (currentEntry) {
                    currentEntry.content = currentContent.join("\n").trim()
                    entries.push(currentEntry)
                }

                // Start new entry
                const version = versionMatch[1]
                const date = versionMatch[2]

                currentEntry = {
                    version,
                    date,
                    content: "",
                    type: getVersionType(version),
                    slug: generateSlug(version),
                }
                currentContent = []
                inContentSection = false
                continue
            }

            // Skip the changelog header and intro
            if (!currentEntry) {
                continue
            }

            // Check if we're starting a content section (### Added, ### Fixed, etc.)
            if (line.match(/^### /)) {
                inContentSection = true
                currentContent.push(line)
                continue
            }

            // If we're in a content section, collect the content
            if (inContentSection) {
                currentContent.push(line)
            }
        }

        // Don't forget the last entry
        if (currentEntry) {
            currentEntry.content = currentContent.join("\n").trim()
            entries.push(currentEntry)
        }

        // Drop entries for versions that haven't been released yet
        const releaseVersion = getReleaseVersion()
        const released = entries.filter(
            (entry) => compareVersions(entry.version, releaseVersion) <= 0
        )
        const skipped = entries.length - released.length
        if (skipped) {
            console.log(
                `⏭️  Skipped ${skipped} entries newer than ${releaseVersion}`
            )
        }

        // Generate CSV
        const csvHeaders = "version,date,content,type,slug\n"
        const csvRows = released
            .map((entry) => {
                return [
                    escapeCsvField(entry.version),
                    escapeCsvField(entry.date),
                    escapeCsvField(entry.content),
                    escapeCsvField(entry.type),
                    escapeCsvField(entry.slug),
                ].join(",")
            })
            .join("\n")

        const csvContent = csvHeaders + csvRows

        // Write CSV file
        fs.writeFileSync(csvPath, csvContent, "utf8")

        console.log(`✅ Successfully converted changelog to CSV`)
        console.log(`📁 Output: ${csvPath}`)
        console.log(`📊 Processed ${released.length} changelog entries`)
    } catch (error) {
        console.error("❌ Error processing changelog:", error.message)
        process.exit(1)
    }
}

// Run the script
if (require.main === module) {
    parseChangelog()
}

module.exports = { parseChangelog }
