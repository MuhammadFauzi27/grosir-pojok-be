class ResponseError extends Error {
  constructor(success, code, message) {
    super(message)
    this.success = success
    this.code = code
  }
}

export default ResponseError