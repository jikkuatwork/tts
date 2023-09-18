const axios = require("axios")
const TelegramBot = require("telegram-bot-api")

const botToken = process.env.TELEGRAM_BOT_TOKEN
const bot = new TelegramBot({ token: botToken })

module.exports = async (req, res) => {
  try {
    const { message } = req.body
    if (!message || !message.text) {
      res.status(200).send("No message provided")
      return
    }

    const chatId = message.chat.id
    const fileUrl = "https://parayu.toolbomber.com/assets/sample.mp3"
    const fileName = "sample.mp3"

    const response = await axios.get(fileUrl, { responseType: "arraybuffer" })
    const fileData = Buffer.from(response.data, "binary")

    await bot.sendAudio({
      chat_id: chatId,
      audio: {
        value: fileData,
        options: {
          filename: fileName,
          contentType: "audio/mpeg",
        },
      },
    })

    res.status(200).send("Audio sent")
  } catch (error) {
    console.error("Error:", error)
    res.status(500).send("An error occurred")
  }
}
