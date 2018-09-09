const relativeDate = require("relative-date")
const LikeDB = require("../")
const syncWithKozmos = require("../lib/kozmos")

const likedb = new LikeDB()
const sync = syncWithKozmos(likedb, {
  host: "http://localhost:9000",
  apiKey: "bZi6",
  apiSecret: "kqlo8tgwi53jte4twanlihuwp72njbmzogdrx9xwqwp7y19re4",
  onPostUpdates: updates => console.info("> > > posted updates", updates),
  onReceiveUpdates: updates =>
    console.log("< < < received updates", updates.content.length)
})

sync.servers.push.store.onChange(update)
sync.servers.pull.postQueue.store.onChange(update)
update()

document.querySelector("button").onclick = () => {
  const input = document.querySelector("input")
  likedb.add({ title: input.value, url: input.value })
}

function update() {
  sync.servers.push.getPushLog((err, log) => {
    document.querySelector(".latest-push").innerHTML = log
      ? relativeDate(Math.floor(log.until / 1000000))
      : ""
  })

  if (sync.servers.pull.postQueue.scheduler.lastCalledAt > 0) {
    document.querySelector(".latest-post").innerHTML = relativeDate(
      sync.servers.pull.postQueue.scheduler.lastCalledAt
    )
  }

  listStored()
  listQueued()
}

async function listStored() {
  document.body.querySelector(".likes").innerHTML = ""

  const count = await likedb.count()
  document.querySelector(".like-count").innerHTML = ` (${count})`

  const likes = await likedb.recent(250)
  document.body.querySelector(".likes").innerHTML = likes
    .map(renderLike)
    .join("")
}

function listQueued() {
  document.body.querySelector(".queued").innerHTML = ""

  const queued = []

  sync.servers.pull.postQueue.store.all(function(err, row) {
    if (err) throw err
    if (!row)
      return (document.body.querySelector(".queued").innerHTML = queued.join(
        "\n"
      ))

    let icon =
      '<img src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjI0cHgiIGhlaWdodD0iMjRweCIgdmlld0JveD0iMCAwIDUxMCA1MTAiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMCA1MTA7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8ZyBpZD0iZmF2b3JpdGUiPgoJCTxwYXRoIGQ9Ik0yNTUsNDg5LjZsLTM1LjctMzUuN0M4Ni43LDMzNi42LDAsMjU3LjU1LDAsMTYwLjY1QzAsODEuNiw2MS4yLDIwLjQsMTQwLjI1LDIwLjRjNDMuMzUsMCw4Ni43LDIwLjQsMTE0Ljc1LDUzLjU1ICAgIEMyODMuMDUsNDAuOCwzMjYuNCwyMC40LDM2OS43NSwyMC40QzQ0OC44LDIwLjQsNTEwLDgxLjYsNTEwLDE2MC42NWMwLDk2LjktODYuNywxNzUuOTUtMjE5LjMsMjkzLjI1TDI1NSw0ODkuNnoiIGZpbGw9IiMwMDAwMDAiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K" />'

    if (row.value.action === "delete") {
      icon =
        '<img class="delete" src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDIxLjkgMjEuOSIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMjEuOSAyMS45IiB3aWR0aD0iMjRweCIgaGVpZ2h0PSIyNHB4Ij4KICA8cGF0aCBkPSJNMTQuMSwxMS4zYy0wLjItMC4yLTAuMi0wLjUsMC0wLjdsNy41LTcuNWMwLjItMC4yLDAuMy0wLjUsMC4zLTAuN3MtMC4xLTAuNS0wLjMtMC43bC0xLjQtMS40QzIwLDAuMSwxOS43LDAsMTkuNSwwICBjLTAuMywwLTAuNSwwLjEtMC43LDAuM2wtNy41LDcuNWMtMC4yLDAuMi0wLjUsMC4yLTAuNywwTDMuMSwwLjNDMi45LDAuMSwyLjYsMCwyLjQsMFMxLjksMC4xLDEuNywwLjNMMC4zLDEuN0MwLjEsMS45LDAsMi4yLDAsMi40ICBzMC4xLDAuNSwwLjMsMC43bDcuNSw3LjVjMC4yLDAuMiwwLjIsMC41LDAsMC43bC03LjUsNy41QzAuMSwxOSwwLDE5LjMsMCwxOS41czAuMSwwLjUsMC4zLDAuN2wxLjQsMS40YzAuMiwwLjIsMC41LDAuMywwLjcsMC4zICBzMC41LTAuMSwwLjctMC4zbDcuNS03LjVjMC4yLTAuMiwwLjUtMC4yLDAuNywwbDcuNSw3LjVjMC4yLDAuMiwwLjUsMC4zLDAuNywwLjNzMC41LTAuMSwwLjctMC4zbDEuNC0xLjRjMC4yLTAuMiwwLjMtMC41LDAuMy0wLjcgIHMtMC4xLTAuNS0wLjMtMC43TDE0LjEsMTEuM3oiIGZpbGw9IiMwMDAwMDAiLz4KPC9zdmc+Cg==" />'
    } else if (row.value.action === "update") {
      icon =
        '<img src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjI0cHgiIGhlaWdodD0iMjRweCIgdmlld0JveD0iMCAwIDQzOC41MzMgNDM4LjUzMyIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNDM4LjUzMyA0MzguNTMzOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxnPgoJPHBhdGggZD0iTTM5Ni4yODMsMTMwLjE4OGMtMy44MDYtOS4xMzUtOC4zNzEtMTYuMzY1LTEzLjcwMy0yMS42OTVsLTg5LjA3OC04OS4wODFjLTUuMzMyLTUuMzI1LTEyLjU2LTkuODk1LTIxLjY5Ny0xMy43MDQgICBDMjYyLjY3MiwxLjkwMywyNTQuMjk3LDAsMjQ2LjY4NywwSDYzLjk1M0M1Ni4zNDEsMCw0OS44NjksMi42NjMsNDQuNTQsNy45OTNjLTUuMzMsNS4zMjctNy45OTQsMTEuNzk5LTcuOTk0LDE5LjQxNHYzODMuNzE5ICAgYzAsNy42MTcsMi42NjQsMTQuMDg5LDcuOTk0LDE5LjQxN2M1LjMzLDUuMzI1LDExLjgwMSw3Ljk5MSwxOS40MTQsNy45OTFoMzEwLjYzM2M3LjYxMSwwLDE0LjA3OS0yLjY2NiwxOS40MDctNy45OTEgICBjNS4zMjgtNS4zMzIsNy45OTQtMTEuOCw3Ljk5NC0xOS40MTdWMTU1LjMxM0M0MDEuOTkxLDE0Ny42OTksNDAwLjA4OCwxMzkuMzIzLDM5Ni4yODMsMTMwLjE4OHogTTI1NS44MTYsMzguODI2ICAgYzUuNTE3LDEuOTAzLDkuNDE4LDMuOTk5LDExLjcwNCw2LjI4bDg5LjM2Niw4OS4zNjZjMi4yNzksMi4yODYsNC4zNzQsNi4xODYsNi4yNzYsMTEuNzA2SDI1NS44MTZWMzguODI2eiBNMzY1LjQ0OSw0MDEuOTkxICAgSDczLjA4OVYzNi41NDVoMTQ2LjE3OHYxMTguNzcxYzAsNy42MTQsMi42NjIsMTQuMDg0LDcuOTkyLDE5LjQxNGM1LjMzMiw1LjMyNywxMS44LDcuOTk0LDE5LjQxNyw3Ljk5NGgxMTguNzczVjQwMS45OTF6IiBmaWxsPSIjMDAwMDAwIi8+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==" />'
    }

    queued.push(`
<div id=${row.value.documentId} class="row">
  ${icon}
  ${row && row.value.documentId}
</div>`)

    row.continue()
  })
}

function renderLike(like) {
  return `
<div id=${like.id} class="row">
 <img onclick="unlike('${
   like.url
 }')" class="delete" src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDIxLjkgMjEuOSIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMjEuOSAyMS45IiB3aWR0aD0iMjRweCIgaGVpZ2h0PSIyNHB4Ij4KICA8cGF0aCBkPSJNMTQuMSwxMS4zYy0wLjItMC4yLTAuMi0wLjUsMC0wLjdsNy41LTcuNWMwLjItMC4yLDAuMy0wLjUsMC4zLTAuN3MtMC4xLTAuNS0wLjMtMC43bC0xLjQtMS40QzIwLDAuMSwxOS43LDAsMTkuNSwwICBjLTAuMywwLTAuNSwwLjEtMC43LDAuM2wtNy41LDcuNWMtMC4yLDAuMi0wLjUsMC4yLTAuNywwTDMuMSwwLjNDMi45LDAuMSwyLjYsMCwyLjQsMFMxLjksMC4xLDEuNywwLjNMMC4zLDEuN0MwLjEsMS45LDAsMi4yLDAsMi40ICBzMC4xLDAuNSwwLjMsMC43bDcuNSw3LjVjMC4yLDAuMiwwLjIsMC41LDAsMC43bC03LjUsNy41QzAuMSwxOSwwLDE5LjMsMCwxOS41czAuMSwwLjUsMC4zLDAuN2wxLjQsMS40YzAuMiwwLjIsMC41LDAuMywwLjcsMC4zICBzMC41LTAuMSwwLjctMC4zbDcuNS03LjVjMC4yLTAuMiwwLjUtMC4yLDAuNywwbDcuNSw3LjVjMC4yLDAuMiwwLjUsMC4zLDAuNywwLjNzMC41LTAuMSwwLjctMC4zbDEuNC0xLjRjMC4yLTAuMiwwLjMtMC41LDAuMy0wLjcgIHMtMC4xLTAuNS0wLjMtMC43TDE0LjEsMTEuM3oiIGZpbGw9IiMwMDAwMDAiLz4KPC9zdmc+Cg==" />
 <div class="title"><strong onClick="changeTitle('${like.url}')">${
    like.title
  }</strong> (${like.url}) [${like.tags.join(", ")} <strong onclick="tag('${
    like.url
  }')">+</strong>/<strong onclick="untag('${like.url}')">-</strong>]</div>
 <div class="ts">${relativeDate(like.updatedAt)}</div>
 <div class="clear"></div>
</div>
`
}

window.unlike = function(url) {
  likedb.delete(url, function(err) {
    console.log("unliked", url, err)
  })
}

window.changeTitle = function(url) {
  likedb
    .updateTitle(url, prompt("Type new title for " + url))
    .catch(err => console.error("update failed", err))
}

window.tag = function(url) {
  likedb
    .tag(url, prompt("Add a new tag for " + url))
    .catch(err => console.error("tagging failed", err))
}

window.untag = function(url) {
  likedb
    .untag(url, prompt("Remove tag from " + url))
    .catch(err => console.error("tagging failed", err))
}

window.filterByTag = async function() {
  const likes = await likedb.listByTag(prompt("Filter by tag"))
  document.body.querySelector(".likes").innerHTML = likes
    .map(renderLike)
    .join("")
}

window.search = async function() {
  const likes = await likedb.searchByTitle(prompt("Search"), 0, 10)
  document.body.querySelector(".likes").innerHTML = likes
    .map(renderLike)
    .join("")
}

window.searchByTags = async function() {
  const results = await likedb.searchByTags(prompt("Search by tags"), 0, 10)
  console.log("result", results)
}

window.searchByUrl = async function() {
  const results = await likedb.searchByUrl(prompt("Search by url"), 0, 10)
  console.log("result", results)
}
