import jwt from "jsonwebtoken"
import config from "../config/config.js"

const signToken = (payload) => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiredIn,
  })
}

const verifyToken = (token) => {
  return jwt.verify(token, config.jwtSecret)
}

export default {
  signToken,
  verifyToken,
}