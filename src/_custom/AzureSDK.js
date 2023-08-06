import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

export async function testKey(subscriptionKey, serviceRegion) {
  var speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
    subscriptionKey,
    serviceRegion || "eastus"
  );

  const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, null);

  let inputText = "Key saved.";

  const resultPromise = new Promise((resolve) => {
    synthesizer.speakTextAsync(
      inputText,
      function (result) {
        synthesizer.close();
        if (
          result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted
        ) {
          console.log(
            "Speech synthesized to speaker for text [",
            inputText,
            "]."
          );
          resolve(true);
        } else if (result.reason === SpeechSDK.ResultReason.Canceled) {
          console.log("Speech synthesis canceled.");
          resolve(false);
        }
      },
      function (error) {
        synthesizer.close();
        console.log("Error:", error);
        resolve(false);
      }
    );
  });

  return resultPromise;
}

// dutch nl-NL-ColetteNeural / nl-NL-FennaNeural
// eng en-US-JaneNeural "en-US-SaraNeural"
// style = friendly
function createSSML(text, voice = "nl-NL-ColetteNeural", style = "neutral") {
  let expressAs = "";

  text = removeEmoji(escapeChars(removeQuotes(text)));

  if (style) {
    expressAs = `<mstts:express-as style="${style}">${text}</mstts:express-as>`;
  } else {
    expressAs = text;
  }

  return `<speak xmlns="http://www.w3.org/2001/10/synthesis"
                xmlns:mstts="http://www.w3.org/2001/mstts"
                xmlns:emo="http://www.w3.org/2009/10/emotionml"
                version="1.0"
                xml:lang="en-US">
                  <voice name="${voice}">
                    ${expressAs}
                  </voice>
                </speak>`;
}

export async function genAudio({ text, key, region, voice, style }) {
  var speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
    key,
    region || "eastus"
  );
  speechConfig.speechSynthesisOutputFormat =
    SpeechSDK.SpeechSynthesisOutputFormat.Audio16Khz64KBitRateMonoMp3;

  const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, null);

  const ssmlText = createSSML(text, voice, style);

  const resultPromise = new Promise((resolve) => {
    synthesizer.speakSsmlAsync(
      ssmlText,
      function (result) {
        synthesizer.close();
        if (
          result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted
        ) {
          const audioData = result.audioData;
          const blob = new Blob([audioData], { type: "audio/mpeg" });
          const url = URL.createObjectURL(blob);

          resolve(url);
        } else if (result.reason === SpeechSDK.ResultReason.Canceled) {
          console.log("Speech synthesis canceled.", result);
          resolve(null);
        }
      },
      function (error) {
        synthesizer.close();
        console.log("Error:", error);
        resolve(null);
      }
    );
  });

  return resultPromise;
}

export async function getVoices(key, region) {
  try {
    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
      key,
      region || "eastus"
    );
    const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, null);
    const result = await synthesizer.getVoicesAsync();
    return result.voices;
  } catch (error) {
    console.error("Error getting available voices:", error);
    return null;
  }
}

const removeEmoji = (text) => {
  return text.replace(
    /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
    ""
  );
};

const removeQuotes = (text) => {
  return text.replace(/"/g, "");
};

const escapeChars = (text) => {
  text = text.replace(/"/g, "&quot;");
  text = text.replace(/&/g, "&amp;");
  text = text.replace(/</g, "&lt;");
  text = text.replace(/>/g, "&gt;");
  return text;
};