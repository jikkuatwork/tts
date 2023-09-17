require 'rack'
require_relative 'tts' # Assuming the TTS class is in a separate file named 'tts.rb'

Handler = Proc.new do |req, res|
  text = req.query['text'] || 'Hello World'
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
    res.status = 200
    res['Content-Type'] = 'audio/mpeg'
    res['Content-Disposition'] = "attachment; filename=\"#{tts.filename}\""
    res['Content-Length'] = mp3_data.bytesize.to_s
    res.write mp3_data
  else
    res.status = 500
    res.write 'Error: Unable to retrieve MP3 data'
  end
end

