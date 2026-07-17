import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

function apkMimePlugin() {
  return {
    name: 'apk-mime',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/app.apk') {
          const filePath = path.resolve(__dirname, 'public', 'app.apk')
          const stat = fs.statSync(filePath)
          res.writeHead(200, {
            'Content-Type': 'application/vnd.android.package-archive',
            'Content-Length': stat.size,
          })
          fs.createReadStream(filePath).pipe(res)
          return
        }
        next()
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apkMimePlugin()],
})
