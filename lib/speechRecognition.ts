// Uses browser's built-in Web Speech API - no API key needed

export interface TranscriptChunk {
  text: string;
  isFinal: boolean;
  confidence: number;
}

export function createSpeechRecognizer(
  onTranscript: (chunk: TranscriptChunk) => void,
  onError: (error: string) => void
) {
  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError("Speech recognition not supported. Use Chrome browser.");
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-IN";

  recognition.onresult = (event: any) => {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      onTranscript({
        text: result[0].transcript,
        isFinal: result.isFinal,
        confidence: result[0].confidence || 0.9,
      });
    }
  };

  recognition.onerror = (event: any) => {
    onError(`Speech error: ${event.error}`);
  };

  return {
    start: () => recognition.start(),
    stop: () => recognition.stop(),
    abort: () => recognition.abort(),
  };
}
