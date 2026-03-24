const { badRequest } = require("./httpErrors");

function normalizeUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") {
    throw badRequest("A valid URL is required.");
  }

  const trimmed = rawUrl.trim();
  if (!trimmed) {
    throw badRequest("A valid URL is required.");
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  let urlObject;
  try {
    urlObject = new URL(withProtocol);
  } catch (error) {
    throw badRequest("Invalid URL format.");
  }

  if (!["http:", "https:"].includes(urlObject.protocol)) {
    throw badRequest("Only http and https URLs are supported.");
  }

  return urlObject.toString();
}

module.exports = {
  normalizeUrl,
};
