import app from "./app.js"
import config from "./config/config.js"

const server = app.listen(config.port, () => {
  console.info(`Server running on port ${config.port}`)
})

server.on("error", (err) => {
  console.error(`Failed to start server: ${err}`)
  process.exit(1)
})

server.on("uncaughtException", (err) => {
  console.error(`Uncaught Exception: ${err}`)
  process.exit(1)
})