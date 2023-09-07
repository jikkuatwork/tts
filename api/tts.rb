require_relative "../TTS.rb"

Handler = Proc.new do |request, response|
  text = request.query["text"] || "Hello World"
  sanitized_text = text.gsub(/[\x00-\x1F\x7F-\x9F]/) { |c| "\\x%02X" % c.ord }


  response.status = 200
  response["Content-Type"] = "text/text; charset=utf-8"

  response["Access-Control-Allow-Origin"] = "*"
  response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
  response["Access-Control-Allow-Headers"] = "Content-Type"

  response.body = TTS.new(sanitized_text).download_link
end
