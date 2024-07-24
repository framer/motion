import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        port: 9990,
    },
    plugins: [react()],
})
