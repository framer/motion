/**
 * Browser-safe usage of process
 */
const mockProcess = { env: { NODE_ENV: "production" } }

const safeProcess = typeof process === "undefined" ? mockProcess : process

// eslint-disable-next-line import/no-default-export
export default safeProcess
