require_relative "./TTS.rb"

m = "Try your own text below! This is the first version, expect bugs. Consider this as a fun experiment. Plus it can also do മലയാളം! ഒന്ന് ട്രൈ ചെയ്തു നോക്കിക്കൂടെ "
m2 = "പക്ഷെ ശിര്കയും മലയാളം തന്നെ ടൈപ്പ് ചെയ്യണം  "
m3 = "ഒന്ന് ട്രൈ ചെയ്തു നോക്കിക്കൂടെ "

p TTS.new(m).download_link
p TTS.new(m).download!
