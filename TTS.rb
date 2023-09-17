require "net/http"
require "json"
require "uri"

class TTS
  attr_reader :filename, :text

  API = URI.parse("https://bff.listnr.tech/backend/ttsNewDemo")

  def initialize(text, filename = nil)
    @text = text
    @filename = filename || "#{(10000 * rand).to_i}.mp3"
  end

  def headers
    {
      "authority" => "bff.listnr.tech",
      "accept" => "*/*",
      "accept-language" => "en-US,en;q=0.7",
      "cache-control" => "no-cache",
      "content-type" => "application/json",
      "origin" => "https://listnr.ai",
      "pragma" => "no-cache",
      "referer" => "https://listnr.ai/",
      "sec-ch-ua" => '"Chromium";v="116", "Not)A;Brand";v="24", "Brave";v="116"',
      "sec-ch-ua-mobile" => "?0",
      "sec-ch-ua-platform" => '"Linux"',
      "sec-fetch-dest" => "empty",
      "sec-fetch-mode" => "cors",
      "sec-fetch-site" => "cross-site",
      "sec-gpc" => "1",
      "user-agent" => "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
    }
  end

  def data
    {
      ttsService: "azure",
      storageService: "gc",
      wordCount: 6,
      rate: 100,
      text: "<speak><p>#{text}</p></speak>",
      audioKey: "dfee094f-7ff7-4b3a-a399-a3817bc53a1d_gc",
      article: {},
      voice: {
        value: "ml-IN-SobhanaNeural",
        lang: "ml-IN",
        style: "Regular",
      },
      audioOutput: {
        fileFormat: "mp3",
        sampleRate: 48000,
      },
    }
  end

  def response
    http = Net::HTTP.new(API.host, API.port)
    http.use_ssl = true if API.scheme == "https"

    @response ||= http.post(API.path, data.to_json, headers)
  end

  def download_link
    prefix = "https://bff.listnr.tech/backend/audio/get/"
    suffix = JSON.parse(response.body)["url"].split("/").last

    link = prefix + suffix
  end

  def download_file
    uri = URI(download_link)

    Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == 'https') do |http|
      request = Net::HTTP::Get.new(uri)

      http.request(request) do |http_response|
        http_response.read_body
      end
    end
  end

  def download!
    response = Net::HTTP.get_response(URI.parse(download_link))

    if response.is_a?(Net::HTTPSuccess)
      File.open(filename, "wb") do |file|
        file.write(response.body)
      end
      puts "Downloaded to: #{filename}"
    else
      puts "Failed to download the file. HTTP Response: #{response.code} #{response.message}"
    end
  end
end
