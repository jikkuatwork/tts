require_relative "../TTS.rb"

Handler = Proc.new do |request, response|
  text = request.query["text"] || "Hello World"

  response.status = 200
  response["Content-Type"] = "text/text; charset=utf-8"
  response.body = TTS.new(text).download_link
end
