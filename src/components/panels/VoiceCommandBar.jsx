import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  Volume2, 
  Send,
  MessageSquare,
  HelpCircle
} from 'lucide-react';
import { voiceService } from '../../services/voiceService';
import { usePawPatrol } from '../../context/PawPatrolContext';

export default function VoiceCommandBar() {
  const { soundEnabled, setSoundEnabled } = usePawPatrol();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const [feedback, setFeedback] = useState('Ask "Where is Bruno?" or "Status report"');

  const suggestions = [
    "Where is Bruno?",
    "Find Tommy",
    "Return to base",
    "Status report",
    "Safe walk"
  ];

  useEffect(() => {
    const unsubStatus = voiceService.onStatus((status) => {
      setIsListening(status === 'listening');
      if (status === 'listening') {
        setFeedback("Listening to your voice... Speak now!");
      } else {
        setTimeout(() => {
          setFeedback('Ask "Where is Bruno?" or "Status report"');
        }, 3000);
      }
    });

    const unsubResult = voiceService.onResult((res) => {
      setTranscript(res.raw || '');
      setFeedback(`Recognized command: "${res.raw}"`);
    });

    return () => {
      unsubStatus();
      unsubResult();
    };
  }, []);

  const handleMicToggle = () => {
    if (isListening) {
      voiceService.stopListening();
    } else {
      voiceService.startListening();
    }
  };

  const handleManualCommand = (cmd) => {
    setTranscript(cmd);
    voiceService.handleTranscript(cmd);
    setTextInput('');
  };

  return (
    <div className="glass-panel rounded-3xl p-3 shadow-xl border border-slate-200/60 dark:border-slate-800/80">
      <div className="flex items-center gap-3">
        {/* Animated Mic Button */}
        <button
          onClick={handleMicToggle}
          title={isListening ? 'Click to stop listening' : 'Click to speak voice command'}
          className={`relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-md ${
            isListening
              ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-500/30'
              : 'bg-gradient-to-tr from-brand-600 to-brand-400 text-white hover:scale-105 active:scale-95 shadow-brand-500/20'
          }`}
        >
          {isListening ? (
            <div className="flex items-center gap-0.5">
              <span className="w-1 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>

        {/* Text Input / Feedback Display */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
            <span className="flex items-center gap-1 font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              <Sparkles className="w-3 h-3" /> Voice AI Dispatch
            </span>
            <span className="truncate max-w-[150px] italic">{feedback}</span>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (textInput.trim()) handleManualCommand(textInput);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder='Type or speak: "Where is Bruno?"'
              className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 px-3 py-1.5 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            {textInput && (
              <button
                type="submit"
                className="bg-brand-600 text-white p-1.5 rounded-xl text-xs hover:bg-brand-500 transition"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Suggested Quick Commands Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pt-2 mt-1 border-t border-slate-200/40 dark:border-slate-800/40 scrollbar-none text-[10px]">
        <span className="text-slate-400 flex items-center gap-0.5 flex-shrink-0">
          <MessageSquare className="w-3 h-3" /> Try:
        </span>
        {suggestions.map((cmd) => (
          <button
            key={cmd}
            onClick={() => handleManualCommand(cmd)}
            className="bg-slate-100 dark:bg-slate-800/60 hover:bg-brand-500/10 hover:text-brand-600 dark:hover:text-brand-400 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-lg whitespace-nowrap transition border border-slate-200/40 dark:border-slate-800"
          >
            {cmd}
          </button>
        ))}
      </div>
    </div>
  );
}

