require 'bundler/setup'
require 'rack'
# require_relative 'tts' # Assuming the TTS class is in a separate file named 'tts.rb'

Handler = Proc.new do |req, res|
  text = req.query['text'] || 'Hello World'
  puts TTS
  tts = TTS.new(text)
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
    base64_mp3_data = Base64.strict_encode64(mp3_data)
    res.status = 200
    res['Content-Type'] = 'text/plain'
    res['Content-Disposition'] = "attachment; filename=\"#{tts.filename}.base64\""
    res['Content-Length'] = base64_mp3_data.bytesize.to_s
    res.body = base64_mp3_data
  else
    res.status = 500
    res.body = 'Error: Unable to retrieve MP3 data'
  end
end

