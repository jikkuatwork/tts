// api/telegram.js
const { IncomingMessage, ServerResponse } = require("http")

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 */
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.statusCode = 405
    res.setHeader("Allow", "POST")
    res.end("Method Not Allowed")
    return
  }

  let body = ""
  req.on("data", chunk => {
    body += chunk.toString()
  })

  req.on("end", async () => {
    const update = JSON.parse(body)
    const chatId = update.message.chat.id
    const text = "Hello, how are you?"

    const botToken = process.env.TELEGRAM_BOT_TOKEN
    const apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`

    const payload = {
      chat_id: chatId,
      text,
    }

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }

    try {
      const response = await fetch(apiUrl, requestOptions)
      const result = await response.json()

      res.statusCode = 200
      res.setHeader("Content-Type", "application/json")
      res.end(JSON.stringify(result))
    } catch (error) {
      console.error(error)
      res.statusCode = 500
      res.end("Internal Server Error")
    }
  })
}
