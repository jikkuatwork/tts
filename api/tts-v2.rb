require 'http'
require 'rack'

Handler = Proc.new do |req, res|
  text = req.query['text'] || 'Hello World'
  api_key = 'your-api-key'
  response = HTTP.get("https://api.voicerss.org/?key=#{api_key}&hl=en-us&src=#{text}&c=MP3&f=44khz_16bit_stereo")

  if response.status.success?
    mp3_data = response.body.to_s
    decoded_text = text.gsub('+', ' ')
    res.status = 200
    res['Content-Type'] = 'audio/mpeg'
    res['Content-Disposition'] = "attachment; filename=\"#{decoded_text}.mp3\""
    res['Content-Length'] = mp3_data.bytesize.to_s
    res.write mp3_data
  else
    res.status = 500
    res.write 'Error: Unable to retrieve MP3 data'
  end
end

