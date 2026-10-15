'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Command,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { VoiceIntentResult } from '@/app/api/ai/voice/route';

interface AdminVoiceInterfaceProps {
  onActionTrigger?: (intent: string, payload?: any) => void;
  variant?: 'floating' | 'card' | 'inline';
}

export default function AdminVoiceInterface({
  onActionTrigger,
  variant = 'card',
}: AdminVoiceInterfaceProps) {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<VoiceIntentResult | null>(null);
  const [speechLanguage, setSpeechLanguage] = useState<'bn-BD' | 'en-US'>('bn-BD');
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports Web Speech API
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = speechLanguage;

        recognition.onstart = () => {
          setIsListening(true);
          setErrorMsg('');
        };

        recognition.onresult = (event: any) => {
          let currentInterim = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              currentInterim += event.results[i][0].transcript;
            }
          }

          setInterimTranscript(currentInterim);
          if (finalTranscript) {
            setTranscript(finalTranscript);
            handleVoiceCommand(finalTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsListening(false);
          if (event.error !== 'no-speech') {
            setErrorMsg(`Mic Error: ${event.error}. You can also type commands below.`);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          setInterimTranscript('');
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, [speechLanguage]);

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
    } else {
      setErrorMsg('');
      setLastResult(null);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.lang = speechLanguage;
          recognitionRef.current.start();
        } catch (e: any) {
          setErrorMsg('Microphone permission required or already active.');
        }
      } else {
        setErrorMsg('Web Speech API is not supported in this browser. Please use text commands.');
      }
    }
  };

  const handleVoiceCommand = async (spokenText: string) => {
    if (!spokenText.trim() || isProcessing) return;
    setIsProcessing(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/ai/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: spokenText,
          language: speechLanguage,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.result) {
          const result: VoiceIntentResult = data.result;
          setLastResult(result);

          // Trigger speech response (TTS) if enabled
          if (ttsEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
            try {
              const utterText = speechLanguage === 'bn-BD' ? result.responseSpeechBn : result.responseSpeechEn;
              const utterance = new SpeechSynthesisUtterance(utterText);
              utterance.lang = speechLanguage;
              utterance.rate = 1.0;
              window.speechSynthesis.speak(utterance);
            } catch (err) {
              console.warn('TTS playback issue:', err);
            }
          }

          if (onActionTrigger) {
            onActionTrigger(result.intent, result);
          }

          // If navigation requested
          if (result.targetUrl && result.intent !== 'general_query') {
            setTimeout(() => {
              router.push(result.targetUrl!);
            }, 1200);
          }
        } else {
          throw new Error(data.error || 'Voice interpretation failed');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to process voice command.');
    } finally {
      setIsProcessing(false);
    }
  };

  const sampleCommands = [
    { label: 'আজকের বিক্রয় দেখাও', query: 'আজকের বিক্রয় দেখাও' },
    { label: 'কম স্টকের জিন্স দেখাও', query: 'কম স্টকের জিন্স দেখাও' },
    { label: 'এই মাসের অর্ডার রিপোর্ট তৈরি করো', query: 'এই মাসের অর্ডার রিপোর্ট তৈরি করো' },
    { label: 'Show pending orders', query: 'Show pending orders' },
  ];

  return (
    <div className="bg-[#0f172a]/95 border border-slate-800 rounded-3xl p-5 shadow-xl text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <Mic className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white">
              Admin Voice AI Commander
            </h4>
            <p className="text-[10px] text-slate-400">
              Speak in Bangla or English to command the backoffice
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Switch */}
          <button
            onClick={() => setSpeechLanguage((prev) => (prev === 'bn-BD' ? 'en-US' : 'bn-BD'))}
            className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 transition-colors"
          >
            {speechLanguage === 'bn-BD' ? 'বাংলা (BD)' : 'English (US)'}
          </button>

          {/* TTS Audio Response Toggle */}
          <button
            onClick={() => setTtsEnabled((prev) => !prev)}
            className={`p-1.5 rounded-lg border transition-colors ${
              ttsEnabled
                ? 'bg-blue-600/20 border-blue-500/40 text-blue-400'
                : 'bg-slate-800 border-slate-700 text-slate-500'
            }`}
            title={ttsEnabled ? 'Voice Feedback Enabled' : 'Voice Feedback Muted'}
          >
            {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Microphone Button Interaction Area */}
      <div className="flex flex-col sm:flex-row items-center gap-4 py-2">
        <button
          type="button"
          onClick={toggleListening}
          className={`relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 shrink-0 ${
            isListening
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/40 ring-4 ring-rose-500/30 scale-105'
              : 'bg-gradient-to-tr from-blue-700 to-indigo-600 text-white shadow-md shadow-blue-600/30 hover:scale-105'
          }`}
          aria-label={isListening ? 'Stop Listening' : 'Start Voice Command'}
        >
          {isListening ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-2xl bg-rose-400 opacity-75" />
              <MicOff className="w-7 h-7 relative z-10" />
            </>
          ) : (
            <Mic className="w-7 h-7" />
          )}
        </button>

        <div className="flex-1 w-full space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-300">
              {isListening
                ? 'Listening... বলুন (যেমন: "আজকের বিক্রয় দেখাও")'
                : isProcessing
                ? 'AI Intent Processing...'
                : 'Click mic or choose a quick command below'}
            </span>
            {isListening && (
              <span className="text-[9px] bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full font-black animate-pulse">
                LIVE AUDIO
              </span>
            )}
          </div>

          <div className="min-h-[42px] bg-[#090d16] border border-slate-800 rounded-xl p-2.5 text-xs font-medium text-slate-300 flex items-center">
            {interimTranscript ? (
              <span className="text-amber-300 italic">{interimTranscript}...</span>
            ) : transcript ? (
              <span className="text-white">"{transcript}"</span>
            ) : (
              <span className="text-slate-500 italic">"আজকের বিক্রয় দেখাও" or "Show low stock jeans"</span>
            )}
          </div>
        </div>
      </div>

      {/* Error Notice */}
      {errorMsg && (
        <div className="mt-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 p-2.5 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Response Card Display */}
      {lastResult && (
        <div className="mt-3 bg-slate-900/90 border border-blue-500/30 rounded-2xl p-3.5 space-y-2 animate-fade-in">
          <div className="flex items-center justify-between text-xs font-bold text-blue-400">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{lastResult.displayCard?.title || 'Command Executed'}</span>
            </div>
            <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-md font-mono">
              {lastResult.intent}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {speechLanguage === 'bn-BD' ? lastResult.responseSpeechBn : lastResult.responseSpeechEn}
          </p>

          {lastResult.targetUrl && (
            <button
              onClick={() => router.push(lastResult.targetUrl!)}
              className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-bold hover:underline pt-1"
            >
              <span>View in AI Control Center &rarr;</span>
            </button>
          )}
        </div>
      )}

      {/* Quick Prompt Pills */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap gap-1.5">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider py-1 mr-1">
          Quick Triggers:
        </span>
        {sampleCommands.map((cmd, idx) => (
          <button
            key={idx}
            onClick={() => {
              setTranscript(cmd.query);
              handleVoiceCommand(cmd.query);
            }}
            className="text-[11px] bg-slate-800/90 hover:bg-blue-900/40 hover:text-blue-300 border border-slate-700/60 text-slate-300 px-2.5 py-1 rounded-xl transition-all active:scale-95"
          >
            {cmd.label}
          </button>
        ))}
      </div>
    </div>
  );
}
