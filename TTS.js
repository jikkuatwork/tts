const https = require("https")
const fs = require("fs")

class TTS {
  constructor(text, filename = null) {
    this.API = new URL("https://bff.listnr.tech/backend/ttsNewDemo")
    this.text = text
    this.filename = filename || `${Math.floor(10000 * Math.random())}.mp3`
  }

  headers() {
    return {
      authority: "bff.listnr.tech",
      accept: "*/*",
      "accept-language": "en-US,en;q=0.7",
      "cache-control": "no-cache",
      "content-type": "application/json",
      origin: "https://listnr.ai",
      pragma: "no-cache",
      referer: "https://listnr.ai/",
      "sec-ch-ua": '"Chromium";v="116", "Not)A;Brand";v="24", "Brave";v="116"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Linux"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "cross-site",
      "sec-gpc": "1",
      "user-agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
    }
  }

  data() {
    return {
      ttsService: "azure",
      storageService: "gc",
      wordCount: 6,
      rate: 100,
      text: `<speak><p>${this.text}</p></speak>`,
      audioKey: "dfee094f-7ff7-4b3a-a399-a3817bc53a1d_gc",
      article: {},
      voice: {
        value: "ml-IN-SobhanaNeural",
        lang: "ml-IN",
        style: "Regular",
      },
      audioOutput: {
        fileFormat: "mp3",
        sampleRate: 48000,
      },
    }
  }

  async getResponse() {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.API.hostname,
        port: this.API.port,
        path: this.API.pathname,
        method: "POST",
        headers: this.headers(),
      }

      const req = https.request(options, res => {
        let data = ""

        res.on("data", chunk => {
          data += chunk
        })

        res.on("end", () => {
          resolve(JSON.parse(data))
        })
      })

      req.on("error", error => {
        reject(error)
      })

      req.write(JSON.stringify(this.data()))
      req.end()
    })
  }

  async downloadLink() {
    const response = await this.getResponse()
    const prefix = "https://bff.listnr.tech/backend/audio/get/"
    const suffix = response.url.split("/").pop()

    return prefix + suffix
  }

  async download() {
    const link = await this.downloadLink()
    const file = fs.createWriteStream(this.filename)

    return new Promise((resolve, reject) => {
      https.get(link, response => {
        if (response.statusCode === 200) {
          response.pipe(file)
          file.on("finish", () => {
            file.close(() => {
              console.log(`Downloaded to: ${this.filename}`)
              resolve()
            })
          })
        } else {
          console.log(
            `Failed to download the file. HTTP Response: ${response.statusCode} ${response.statusMessage}`
          )
          reject()
        }
      })
    })
  }
}

module.exports = TTS
