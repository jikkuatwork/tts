require "uri"
require_relative "../TTS.rb"

Handler = Proc.new do |request, response|
  text = request.query["text"] || "Hello World"
  decoded_text = URI.decode_www_form_component(text)

  response.status = 200
  response["Content-Type"] = "text/text; charset=utf-8"

  response["Access-Control-Allow-Origin"] = "*"
  response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
  response["Access-Control-Allow-Headers"] = "Content-Type"

  response.body = TTS.new(decoded_text).download_file
end
