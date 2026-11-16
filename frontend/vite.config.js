import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const apiBase = env.VITE_API_BASE_URL || "https://api-atomurl.gurujadhav.in"

  return {
    plugins: [
      react(),
      {
        name: "generate-redirects",
        buildStart() {
          const content = `# Cloudflare Pages Redirects
# 1. OAuth authentication callback route
/auth/*             /index.html    200

# 2. Static assets directory
/assets/*           /assets/:splat 200

# 3. Short URLs forward to backend redirect engine (from VITE_API_BASE_URL)
/*                  ${apiBase}/:splat  307
`
          fs.writeFileSync(path.resolve(__dirname, "public/_redirects"), content)
        }
      }
    ],
    server: {
      port: 3000,
      host: true
    }
  }
})
