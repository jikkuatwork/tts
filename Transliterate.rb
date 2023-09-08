require "httparty"
require "json"

class Transliterate
  API = "https://www.google.com/inputtools/request"

  def initialize(from_language = "en", to_language = "ml")
    @from_language = from_language
    @to_language = to_language
  end

  def get_suggestions(text, number_of_suggestions = 5)
    response = HTTParty.get(API, query: { text: text, num: number_of_suggestions, ime: "transliteration_#{@from_language}_#{@to_language}" })

    if response.success?
      json = JSON.parse(response.body)[1][0]
      { query: json[0], suggestions: json[1] }
    else
      raise "Request failed with code #{response.code}: #{response.message}"
    end
  end
end
