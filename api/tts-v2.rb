require "uri"
require "net/http"
require_relative "../TTS.rb"

Handler = Proc.new do |request, response|
  text = request.query["text"] || "Hello World"
  decoded_text = URI.decode_www_form_component(text)

  response.status = 200
  response["Content-Type"] = "audio/mpeg"
  response["Content-Disposition"] = "attachment; filename=\"output.mp3\""

  response["Access-Control-Allow-Origin"] = "*"
  response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
  response["Access-Control-Allow-Headers"] = "Content-Type"

  download_link = TTS.new(decoded_text).download_link
  uri = URI(download_link)

  Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == 'https') do |http|
    request = Net::HTTP::Get.new(uri)

    http.request(request) do |http_response|
      http_response.read_body do |chunk|
        response.write(chunk)
      end
    end
  end
end
