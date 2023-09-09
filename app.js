window.app = {
  isConverting: false,
  isPlaying: false,
  audioURL: "",
  audioPlayer: document.querySelector("#audio-player"),
  clipboard: document.querySelector("#clipboard"),
  shareButton: document.querySelector("#share-button"),
  playbackButton: document.querySelector("#playback-button"),
  defaultId: "534e49035",
  rootLink: "https://parayu.toolbomber.com/3/",

  getText: () => document.querySelector("#text-area").value,

  setText: text => (document.querySelector("#text-area").value = text),

  shareLink: {
    value: id => `${app.rootLink}?id=${id}`,
    get: () => app.clipboard.value,
    set: link => (app.clipboard.value = link),
    copy: async () => await navigator.clipboard.writetext(app.clipboard),
  },

  updateAddressWithShareLink: link => window.history.pushState(null, "", link),

  getQueryValueOf: key => {
    const queryString = window.location.search
    const queryParams = {}

    if (queryString) {
      const keyValuePairs = queryString.slice(1).split("&")

      keyValuePairs.forEach(pair => {
        const [key, value] = pair.split("=")
        queryParams[decodeURIComponent(key)] = decodeURIComponent(value || "")
      })
    }

    return queryParams[key]
  },

  loadText: async id => {
    const webArray = new WebArray({ read: id })
    const array = await webArray.read()
    const text = array[array.length - 1]

    return text
  },

  saveText: async text => {
    const seed = await app.getHash(text)
    const wa = await WebArray.create(seed)
    wa.append(text)
    const id = wa.keys.read

    return id
  },

  getHash: async text => {
    const encoder = new TextEncoder()
    const data = encoder.encode(text)
    const hashBuffer = await crypto.subtle.digest("SHA-256", data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("")
    return hashHex
  },

  updateUI: () => {},

  play: () => {
    app.isPlaying = true
    app.audioPlayer.play()
  },

  pause: () => {
    app.isPlaying = false
    app.audioPlayer.pause()
  },

  load: async () => {
    const id = app.getQueryValueOf("id") || app.defaultId
    const shareLink = app.shareLink.value(id)
    const text = await app.loadText(id)
    app.setText(text)

    app.shareLink.set(shareLink)
  },

  save: async () => {
    const text = app.getText()
    const id = await app.saveText(text)
    const shareLink = app.shareLink.value(id)
    app.shareLink.set(shareLink)
  },

  initialize: () => {},
}
