import jwt from "../utils/jwt.js"

const authMiddleware = async (req, res, next) => {
  const { authorization } = req.headers

  if (!authorization.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      code: 401,
      message: "Unauthorized"
    })
  }

  const token = authorization.split(' ')[1]
  try {
    req.user = jwt.verifyToken(token)
    next()
  } catch (err) {
    res.status(401).json({
      success: false,
      code: 401,
      message: "Unauthorized"
    })
  }
}

export default authMiddleware