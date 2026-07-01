import dotenv from 'dotenv'

dotenv.config()

const config = {
  port: process.env.PORT || 3000,
  bcryptSalt: Number(process.env.SALT),
  jwtSecret: process.env.JWT_SECRET,
  databaseUrl: process.env.DATABASE_URL,
  jwtExpiredIn: process.env.JWT_EXPIRED_IN,
}

export default config