import fetch from "node-fetch"

module.exports = async (req, res) => {
  // Check if the request method is POST
  if (req.method === "POST") {
    // Parse the incoming request body
    const body = JSON.parse(req.body)

    // Extract the message text and chat ID from the request
    const messageText = body.message.text
    const chatId = body.message.chat.id

    // Replace spaces with '+' for the TTS API request
    const formattedText = messageText.replace(/ /g, "+")

    // Define the TTS API URL
    const apiUrl = `https://parayu.toolbomber.com/api/tts-download?text=${formattedText}`

    // Fetch the MP3 file from the TTS API
    const response = await fetch(apiUrl)

    // Check if the response status is OK
    if (response.ok) {
      // Get the MP3 file as a Buffer
      const mp3Buffer = await response.buffer()

      // Use the TELEGRAM_BOT_TOKEN environment variable
      const botToken = process.env.TELEGRAM_BOT_TOKEN
      const sendAudioUrl = `https://api.telegram.org/bot${botToken}/sendAudio`

      // Create a FormData object to send the MP3 file
      const formData = new FormData()
      formData.append("chat_id", chatId)
      formData.append("audio", mp3Buffer, {
        filename: `${formattedText}.mp3`,
        contentType: "audio/mpeg",
      })

      // Send the MP3 file to the Telegram chat
      const sendAudioResponse = await fetch(sendAudioUrl, {
        method: "POST",
        body: formData,
      })

      if (sendAudioResponse.ok) {
        res.status(200).send("MP3 file sent successfully.")
      } else {
        res.status(500).send("Error sending the MP3 file to the Telegram chat.")
      }
    } else {
      res.status(500).send("Error fetching the MP3 file from the TTS API.")
    }
  } else {
    res.status(400).send("Invalid request method. Use POST.")
  }
}
