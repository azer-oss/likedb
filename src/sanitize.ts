import * as anglicize from "anglicize"
import { clean as cleanUrl } from "urls"

export function sanitizeBookmark(bookmark) {
  delete bookmark.raw_url

  return {
    ...bookmark,
    cleanUrl: cleanUrl(bookmark.url),
    cleanTitle: title(bookmark.title)
  }
}

export function sanitizeCollection(collection) {
  return {
    ...collection,
    normalizedTitle: sanitizeSearchQuery(collection.title)
  }
}

export function sanitizeSearchQuery(query) {
  return anglicize(query)
    .toLowerCase()
    .replace(/[^\w\s]+/g, " ")
    .split(/\s+/g)
    .join(" ")
}

function title(title) {
  if (!title) return ""
  return anglicize(title.trim().toLowerCase())
}
