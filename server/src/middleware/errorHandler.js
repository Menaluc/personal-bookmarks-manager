function errorHandler(error, _req, res, _next) {
  const statusCode = error.statusCode || 500;
  const code = error.code || "INTERNAL_SERVER_ERROR";
  const message = error.message || "Something went wrong.";

  const payload = {
    error: {
      code,
      message,
    },
  };

  if (error.details) {
    payload.error.details = error.details;
  }

  if (statusCode >= 500) {
    // eslint-disable-next-line no-console
    console.error(error);
  }

  res.status(statusCode).json(payload);
}

module.exports = {
  errorHandler,
};
