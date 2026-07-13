import express from "express"
import morgan from "morgan"
import helmet from "helmet"
import cors from "cors"
import mainRoute from "./routes/index.js"
import errorMiddleware from "./middlewares/errorMiddleware.js"


const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan("dev"))
app.use(helmet())
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:5173"]

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman, etc.)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    return callback(new Error("Not allowed by CORS"))
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true
}))

app.use('/v1', mainRoute)

app.use(errorMiddleware)

export default app