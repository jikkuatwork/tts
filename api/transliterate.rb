require "uri"
require "json"
require_relative "../Transliterate.rb"

Handler = Proc.new do |request, response|
  text = request.query["text"] || "Sukhamano"
  from = request.query["from"] || "en"
  to = request.query["to"] || "ml"

  decoded_text = URI.decode_www_form_component(text)

  response.status = 200
  response["Content-Type"] = "text/text; charset=utf-8"

  response["Access-Control-Allow-Origin"] = "*"
  response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
  response["Access-Control-Allow-Headers"] = "Content-Type"

  response.body = Transliterate.new(from, to).get_suggestions(text, 4).to_json
end
