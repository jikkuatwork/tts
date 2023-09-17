require 'bundler/setup'
require 'rack'
require 'net/http'
require 'uri'
require_relative "../TTS.rb"

Handler = Proc.new do |env|
  req = Rack::Request.new(env)
  text = req.GET['text'] || 'Hello World'
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
    res = Rack::Response.new
    res.status = 200
    res["Access-Control-Allow-Origin"] = "*"
    res["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    res["Access-Control-Allow-Headers"] = "Content-Type"

    res['Content-Type'] = 'audio/mpeg'
    res['Content-Disposition'] = "attachment; filename=\"parayu.mp3\""
    res['Content-Length'] = mp3_data.bytesize.to_s
    res.write mp3_data
    res.finish
  else
    res = Rack::Response.new
    res.status = 500
    res.write 'Error: Unable to retrieve MP3 data'
    res.finish
  end
end

