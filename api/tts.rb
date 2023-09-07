require_relative "../TTS.rb"

Handler = Proc.new do |request, response|
  text = request.query["text"] || "Hello World"

  response.status = 200
  response["Content-Type"] = "text/text; charset=utf-8"

  response["Access-Control-Allow-Origin"] = "*"
  response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
  response["Access-Control-Allow-Headers"] = "Content-Type"

  response.body = TTS.new(text).download_link
end
