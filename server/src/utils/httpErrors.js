class AppError extends Error {
  constructor(statusCode, code, message, details) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

function badRequest(message, details) {
  return new AppError(400, "BAD_REQUEST", message, details);
}

function notFound(message, details) {
  return new AppError(404, "NOT_FOUND", message, details);
}

function conflict(message, details) {
  return new AppError(409, "CONFLICT", message, details);
}

function unprocessable(message, details) {
  return new AppError(422, "UNPROCESSABLE_ENTITY", message, details);
}

module.exports = {
  AppError,
  badRequest,
  notFound,
  conflict,
  unprocessable,
};
