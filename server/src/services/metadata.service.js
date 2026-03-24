const fetch = require("node-fetch");
const cheerio = require("cheerio");
const { unprocessable } = require("../utils/httpErrors");

const DEFAULT_TIMEOUT_MS = 8000;

function resolveFavicon($, pageUrl) {
  const href =
    $('link[rel="icon"]').attr("href") ||
    $('link[rel="shortcut icon"]').attr("href") ||
    $('link[rel="apple-touch-icon"]').attr("href");

  if (href) {
    try {
      return new URL(href, pageUrl).toString();
    } catch (_error) {
      return "";
    }
  }

  try {
    const fallback = new URL("/favicon.ico", pageUrl);
    return fallback.toString();
  } catch (_error) {
    return "";
  }
}

function getDescription($) {
  return (
    $('meta[name="description"]').attr("content") ||
    $('meta[property="og:description"]').attr("content") ||
    $('meta[name="twitter:description"]').attr("content") ||
    ""
  ).trim();
}

async function fetchBookmarkMetadata(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent": "PersonalBookmarksManager/1.0 (+metadata-bot)",
        accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      throw unprocessable("Failed to fetch URL metadata.", {
        status: response.status,
        statusText: response.statusText,
      });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const title = ($("title").first().text() || "").trim() || url;
    const description = getDescription($);
    const favicon = resolveFavicon($, response.url || url);

    return {
      title,
      description,
      favicon,
      resolvedUrl: response.url || url,
    };
  } catch (error) {
    if (error.name === "AbortError") {
      throw unprocessable("Metadata fetch timed out.");
    }
    if (error.statusCode) throw error;
    throw unprocessable("Unable to fetch metadata for the provided URL.", {
      reason: error.message,
    });
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = {
  fetchBookmarkMetadata,
};
