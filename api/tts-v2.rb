require "uri"
require "net/http"
require_relative "../TTS.rb"

Handler = Proc.new do |request, response|
  text = request.query["text"] || "Hello World"
  decoded_text = URI.decode_www_form_component(text)

  # Download the MP3 file
  mp3_url = TTS.new(decoded_text).download_link
  mp3_data = Net::HTTP.get(URI.parse(mp3_url))

  # Set response headers
  response.status = 200
  response["Content-Type"] = "audio/mpeg"
  response["Content-Disposition"] = "attachment; filename=\"#{decoded_text}.mp3\""
  response["Content-Length"] = mp3_data.bytesize
  response["Access-Control-Allow-Origin"] = "*"
  response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
  response["Access-Control-Allow-Headers"] = "Content-Type"

  # Write the MP3 data to the response body
  response.body = mp3_data
end

