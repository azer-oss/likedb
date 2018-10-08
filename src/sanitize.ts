import anglicize from "anglicize"
import { clean as cleanUrl } from urls

export default function sanitize(bookmark) {
  delete bookmark.raw_url

  return {
    ...bookmark,
    cleanUrl: cleanUrl(bookmark.url),
    cleanTitle: title(bookmark.title)
  }
}

function title(title) {
  if (!title) return ""
  return anglicize(title.trim().toLowerCase())
}
