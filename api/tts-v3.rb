require 'bundler/setup'
require 'rack'
require_relative "../TTS.rb"

Handler = Proc.new do |req, res|
  text = req.query['text'] || 'Hello World'
  decoded_text = URI.decode_www_form_component(text)
  tts = TTS.new(decoded_text)
  download_link = tts.download_link

  uri = URI(download_link)
  mp3_data = nil

  Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == 'https') do |http|
    request = Net::HTTP::Get.new(uri)
    http.request(request) do |http_response|
      mp3_data = http_response.read_body
    end
  end

  if mp3_data
    res.status = 200
    res["Access-Control-Allow-Origin"] = "*"
    res["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    res["Access-Control-Allow-Headers"] = "Content-Type"

    res['Content-Type'] = 'audio/mpeg'
    res['Content-Disposition'] = "attachment; filename=\"parayu.mp3\""
    res['Content-Length'] = mp3_data.bytesize.to_s # Use bytesize of mp3_data, not the Array
    res.body = [mp3_data] # Set the response body as an Array containing the MP3 data
  else
    res.status = 500
    res.body = 'Error: Unable to retrieve MP3 data'
  end
end

