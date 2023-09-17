// api/tts.js
const { parse } = require("url")
const https = require("https")
const TTS = require("../TTS")

module.exports = async (req, res) => {
  const { query } = parse(req.url, true)
  const text = query.text || "Hello, World!"

  const tts = new TTS(text)
  try {
    const downloadLink = await tts.downloadLink()

    const requestOptions = new URL(downloadLink)
    https
      .get(requestOptions, response => {
        let mp3Data = []

        response.on("data", chunk => {
          mp3Data.push(chunk)
        })

        response.on("end", () => {
          const base64Mp3Data = Buffer.concat(mp3Data).toString("base64")

          res.statusCode = 200
          res.setHeader("Access-Control-Allow-Origin", "*")
          res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
          res.setHeader("Access-Control-Allow-Headers", "Content-Type")
          res.setHeader("Content-Type", "text/plain")
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="${tts.filename}.base64"`
          )
          res.setHeader("Content-Length", base64Mp3Data.length)
          res.end(base64Mp3Data)
        })
      })
      .on("error", error => {
        res.statusCode = 500
        res.setHeader("Content-Type", "text/plain")
        res.end("Error: Unable to retrieve MP3 data")
      })
  } catch (error) {
    res.statusCode = 500
    res.setHeader("Content-Type", "text/plain")
    res.end("An error occurred while processing your request.")
  }
}
