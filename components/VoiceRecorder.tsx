import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Play, Pause, Trash2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VoiceRecorderProps {
  audioUrl: string | null;
  onRecorded: (blob: Blob, url: string) => void;
  onRemove: () => void;
}

export default function VoiceRecorder({ audioUrl, onRecorded, onRemove }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const MAX_DURATION = 30; // seconds

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      setRecordingTime(0);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        onRecorded(blob, url);
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= MAX_DURATION - 1) {
            stopRecording();
            return MAX_DURATION;
          }
          return prev + 1;
        });
      }, 1000);
    } catch {
      console.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const playAudio = () => {
    if (!audioUrl) return;
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    setIsPlaying(true);
    setPlaybackTime(0);

    audio.onloadedmetadata = () => setDuration(audio.duration);
    audio.ontimeupdate = () => setPlaybackTime(audio.currentTime);
    audio.onended = () => setIsPlaying(false);
    audio.play();
  };

  const pauseAudio = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="glass rounded-2xl p-5">
      <label className="text-sm font-medium text-foreground/80 mb-1.5 block">
        Voice intro 🎙️
      </label>
      <p className="text-xs text-muted-foreground mb-4">
        Record a short voice clip (up to 30s) so matches can hear your voice
      </p>

      <AnimatePresence mode="wait">
        {!audioUrl && !isRecording && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center"
          >
            <Button
              onClick={startRecording}
              className="h-16 w-16 rounded-full gradient-primary border-0 shadow-lg"
            >
              <Mic className="w-6 h-6" />
            </Button>
          </motion.div>
        )}

        {isRecording && (
          <motion.div
            key="recording"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute inset-0 rounded-full bg-destructive/20"
              />
              <Button
                onClick={stopRecording}
                className="h-16 w-16 rounded-full bg-destructive hover:bg-destructive/90 border-0 relative z-10"
              >
                <Square className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
              <span className="text-foreground/80 font-mono">{formatTime(recordingTime)}</span>
              <span className="text-muted-foreground">/ {formatTime(MAX_DURATION)}</span>
            </div>
            {/* Visualizer bars */}
            <div className="flex items-end gap-0.5 h-8">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ height: [4, Math.random() * 28 + 4, 4] }}
                  transition={{ repeat: Infinity, duration: 0.5 + Math.random() * 0.5, delay: i * 0.05 }}
                  className="w-1 rounded-full bg-primary/60"
                />
              ))}
            </div>
          </motion.div>
        )}

        {audioUrl && !isRecording && (
          <motion.div
            key="playback"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3"
          >
            <Button
              onClick={isPlaying ? pauseAudio : playAudio}
              size="icon"
              className="h-10 w-10 rounded-full gradient-primary border-0 shrink-0"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>

            <div className="flex-1">
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  style={{ width: duration > 0 ? `${(playbackTime / duration) * 100}%` : "0%" }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatTime(playbackTime)} / {duration > 0 ? formatTime(duration) : formatTime(recordingTime)}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-success" />
              <Button variant="ghost" size="icon" onClick={onRemove} className="text-destructive h-8 w-8">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
