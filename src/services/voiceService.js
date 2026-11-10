/**
 * Voice Command Service
 * Supports Web Speech Recognition API with fallback text simulation,
 * plus Web SpeechSynthesis for audio feedback.
 */

class VoiceService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
    this.listeners = {
      result: new Set(),
      status: new Set()
    };

    this.initRecognition();
  }

  initRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        this.emitStatus('listening');
      };

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        this.handleTranscript(transcript);
      };

      this.recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        this.isListening = false;
        this.emitStatus('idle');
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.emitStatus('idle');
      };
    }
  }

  startListening() {
    if (this.recognition) {
      try {
        this.recognition.start();
      } catch (e) {
        console.warn('Recognition already active or blocked:', e);
      }
    } else {
      this.emitStatus('unsupported');
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      this.emitStatus('idle');
    }
  }

  // Parse voice commands
  handleTranscript(transcript) {
    const raw = transcript.trim();
    const lower = raw.toLowerCase();
    let action = { raw, type: 'unknown', text: raw };

    if (lower.includes('where is') || lower.includes('find') || lower.includes('locate') || lower.includes('show me')) {
      // Extract dog name
      const words = lower.replace(/where is|find|locate|show me|\?/g, '').trim().split(' ');
      const candidateName = words[0];
      action = {
        type: 'FIND_DOG',
        dogName: candidateName,
        raw
      };
    } else if (lower.includes('return to base') || lower.includes('go home') || lower.includes('dock') || lower.includes('charge')) {
      action = { type: 'RETURN_BASE', raw };
    } else if (lower.includes('start patrol') || lower.includes('patrol') || lower.includes('resume')) {
      action = { type: 'START_PATROL', raw };
    } else if (lower.includes('pause') || lower.includes('stop') || lower.includes('hold')) {
      action = { type: 'PAUSE_PATROL', raw };
    } else if (lower.includes('battery') || lower.includes('status') || lower.includes('report')) {
      action = { type: 'STATUS_REPORT', raw };
    } else if (lower.includes('walk with me') || lower.includes('safe walk') || lower.includes('escort')) {
      action = { type: 'SAFE_WALK', raw };
    } else if (lower.includes('lost dog') || lower.includes('missing dog')) {
      action = { type: 'LOST_DOG', raw };
    }

    this.emitResult(action);
  }

  // Speak out voice response
  speak(text) {
    if (!this.synth) return;
    try {
      this.synth.cancel(); // Stop prior speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 1.1; // friendly robot tone
      utterance.rate = 1.0;
      this.synth.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
    }
  }

  onResult(callback) {
    this.listeners.result.add(callback);
    return () => this.listeners.result.delete(callback);
  }

  onStatus(callback) {
    this.listeners.status.add(callback);
    return () => this.listeners.status.delete(callback);
  }

  emitResult(data) {
    this.listeners.result.forEach(cb => cb(data));
  }

  emitStatus(status) {
    this.listeners.status.forEach(cb => cb(status));
  }
}

export const voiceService = new VoiceService();

