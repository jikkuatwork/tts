window.app = {
  isConverting: false,
  isPlaying: false,
  isDownloadProcessing: false,
  isMenuOpen: false,
  audioLink: "",
  audioPlayer: document.querySelector("#audio-player"),
  textArea: document.querySelector("#text-area"),
  clipboard: document.querySelector("#clipboard"),
  shareButton: document.querySelector("#share-button"),
  playbackButton: document.querySelector("#playback-button"),
  filename: "parayu.mp3",
  defaultId: "b00a9c036",
  internalRoute: "",
  rootLink: "https://parayu.toolbomber.com/3/",
  api: "https://parayu.toolbomber.com/api/tts/",
  flipper: document.querySelector("#lottie-flip"),

  handleDownload: async () => {
    app.isDownloadProcessing = true
    app.updateUI()

    const text = app.getText()
    const audioLink = await app.getAudioLink(text)
    app.loadAudio(audioLink)

    app.downloadAudio(audioLink)
  },

  handlePlayback: () => {
    if (app.isConverting) {
      return
    }

    if (app.isPlaying) {
      app.pause()
    } else {
      app.play()
    }
  },

  handleShare: async () => {
    const shareLink = await app.shareLink.refresh()
    app.shareLink.copy()

    console.log(shareLink)
  },

  handleDelete: () => {
    console.log("delete")
  },

  handleMenu: () => {
    app.toggleMenu()
    app.flip()

    app.isMenuOpen = !app.isMenuOpen
  },

  toggleMenu: () => {
    let menuWidth = 50

    if (!app.isMenuOpen) {
      menuWidth = 168
    }

    const rightControl = document.querySelector("#right-control")

    popmotion
      .tween({
        from: rightControl.offsetWidth,
        to: menuWidth,
        duration: 1000, // You can adjust the duration as needed
        ease: popmotion.easing.easeInOut,
      })
      .start({
        update: function (v) {
          rightControl.style.width = v + "px"
        },
      })
  },

  downloadAudio: async (link, filename = app.filename) => {
    try {
      const response = await fetch(link)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)

      const anchorElement = document.createElement("a")
      anchorElement.href = blobUrl
      anchorElement.download = filename
      anchorElement.style.display = "none"
      document.body.appendChild(anchorElement)
      anchorElement.click()
      document.body.removeChild(anchorElement)

      // Release the Blob URL after a short delay
      setTimeout(() => {
        app.isDownloadProcessing = false
        app.updateUI()
        URL.revokeObjectURL(blobUrl)
      }, 100)
    } catch (error) {
      console.error("Error downloading file:", error)
    }
  },

  getAudioLink: async text => {
    if (text.trim() === "") {
      return
    }

    const encodedText = encodeURIComponent(text)

    const link = await fetch(`${app.api}?text=${encodedText}`).then(r =>
      r.text()
    )

    return link
  },

  loadAudio: link => (app.audioPlayer.src = link),

  getText: () => document.querySelector("#text-area").value,

  setText: text => (document.querySelector("#text-area").value = text),

  shareLink: {
    value: id => `${app.rootLink}?id=${id}`,
    get: () => app.clipboard.value,
    set: link => (app.clipboard.value = link),
    copy: async () => await navigator.clipboard.writeText(app.clipboard.value),
    refresh: async () => await app.save(),
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

  updateShareLinkUI: () => {
    if (app.isConverting) {
      app.shareButton.classList.remove("opacity-90")
      app.shareButton.classList.remove("cursor-pointer")
      app.shareButton.classList.add("opacity-60")
    } else {
      app.shareButton.classList.remove("opacity-60")
      app.shareButton.classList.add("opacity-90")
      app.shareButton.classList.add("cursor-pointer")
    }
  },

  updatePlaybackUI: () => {
    const glyphs = {}
    glyphs.play = document.querySelector("#svg-play")
    glyphs.pause = document.querySelector("#svg-pause")
    glyphs.loader = document.querySelector("#svg-loader")

    window.glyphs = glyphs

    if (app.isConverting) {
      glyphs.loader.classList.remove("hidden")
      glyphs.play.classList.add("hidden")
      glyphs.pause.classList.add("hidden")
      return
    } else {
      glyphs.loader.classList.add("hidden")
    }

    if (app.isPlaying) {
      glyphs.play.classList.add("hidden")
      glyphs.pause.classList.remove("hidden")
    } else {
      glyphs.play.classList.remove("hidden")
      glyphs.pause.classList.add("hidden")
    }
  },

  updateDownloadUI: () => {
    glyphs.loader = document.querySelector("#svg-loader-download")
    glyphs.download = document.querySelector("#svg-download")

    if (app.isDownloadProcessing) {
      glyphs.loader.classList.remove("hidden")
      glyphs.download.classList.add("hidden")
    } else {
      glyphs.loader.classList.add("hidden")
      glyphs.download.classList.remove("hidden")
    }
  },

  updateUI: () => {
    app.updatePlaybackUI()
    app.updateShareLinkUI()
    app.updateDownloadUI()
  },

  play: async () => {
    app.isConverting = true
    app.updateUI()

    const link = await app.getAudioLink(app.getText())
    app.loadAudio(link)

    app.isPlaying = true
    app.audioPlayer.play()
    app.updateUI()

    app.save()
  },

  pause: () => {
    app.isPlaying = false
    app.audioPlayer.pause()
    app.updateUI()
  },

  load: async () => {
    const id = app.getQueryValueOf("id") || app.defaultId
    const shareLink = app.shareLink.value(id)
    const text = await app.loadText(id)
    app.setText(text)

    app.shareLink.set(shareLink)
    app.refreshAddress(id)
  },

  save: async () => {
    const text = app.getText()
    const id = await app.saveText(text)
    const shareLink = app.shareLink.value(id)
    app.shareLink.set(shareLink)

    app.refreshAddress(id)

    return shareLink
  },

  refreshAddress: id => {
    window.history.pushState(null, "", `/${app.internalRoute}/?id=${id}`)
  },

  flip: () => {
    let from = 0
    let to = 180

    if (app.isMenuOpen) {
      from = 180
      to = 0
    }

    popmotion
      .tween({
        from,
        to,
        duration: 1000, // Adjust the duration as needed
        ease: popmotion.easing.easeInOut,
      })
      .start({
        update: function (v) {
          app.flipper.style.transform = `rotate(${v}deg)`
        },
      })
  },

  setListeners: () => {
    app.audioPlayer.addEventListener("ended", () => {
      app.isPlaying = false
      app.updateUI()
    })

    app.audioPlayer.addEventListener("canplaythrough", () => {
      app.isConverting = false
      app.updateUI()
    })
  },

  initialize: () => {
    app.load()
    app.setListeners()
    app.updateUI()
  },
}

app.initialize()
