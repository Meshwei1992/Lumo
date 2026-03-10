import { motion, AnimatePresence } from "framer-motion";
import { UserProfile, conversationVibes } from "@/lib/mockData";
import { X, Eye, Sparkles, Volume2, Heart } from "lucide-react";
import PixelatedImage from "./PixelatedImage";
import { useState, useRef } from "react";

interface MatchProfilePopupProps {
  profile: UserProfile;
  revealLevel: number;
  connectionScore: number;
  isOpen: boolean;
  onClose: () => void;
}

const revealMessages = [
  { min: 0, max: 10, text: "עדיין בתחילת הדרך... המשיכו לדבר! 🌱", emoji: "🔒" },
  { min: 10, max: 30, text: "משהו מתחיל להיחשף... סקרנים? 😏", emoji: "👀" },
  { min: 30, max: 50, text: "ככה זה כשמתחילים להכיר! הפנים מתגלות 🎭", emoji: "✨" },
  { min: 50, max: 75, text: "וואו, יש פה חיבור אמיתי! עכשיו אפשר לראות 💫", emoji: "🔥" },
  { min: 75, max: 99, text: "כמעט שם! עוד קצת ותראו הכל 🤩", emoji: "💖" },
  { min: 100, max: 100, text: "ככה זה כשמכירים באמת — עכשיו גם רואים! 💕", emoji: "🎉" },
];

export default function MatchProfilePopup({ profile, revealLevel, connectionScore, isOpen, onClose }: MatchProfilePopupProps) {
  const vibeInfo = conversationVibes.find(v => v.value === profile.vibe);
  const [playingVoice, setPlayingVoice] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const revealMsg = revealMessages.find(m => revealLevel >= m.min && revealLevel <= m.max) || revealMessages[0];

  const toggleVoice = () => {
    if (!profile.voiceClipUrl) return;
    if (playingVoice) {
      audioRef.current?.pause();
      setPlayingVoice(false);
    } else {
      const audio = new Audio(profile.voiceClipUrl);
      audioRef.current = audio;
      setPlayingVoice(true);
      audio.onended = () => setPlayingVoice(false);
      audio.play();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          />
          
          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-[10vh] z-50 max-w-md mx-auto"
          >
            <div className="glass rounded-3xl overflow-hidden border border-border/50 shadow-2xl">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-background/60 backdrop-blur-md flex items-center justify-center text-foreground/70 hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Photo with pixelation */}
              <div className="relative h-64 overflow-hidden">
                <PixelatedImage
                  src={profile.image}
                  compatibility={profile.compatibility}
                  revealLevel={revealLevel}
                  className="w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                
                {/* Reveal badge */}
                <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md bg-primary/20 text-primary border border-primary/20">
                  <Eye className="w-3.5 h-3.5" />
                  {revealLevel}% revealed
                </div>

                {/* Name overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h2 className="text-2xl font-display font-bold text-foreground">
                    {profile.name}, {profile.age}
                  </h2>
                </div>
              </div>

              {/* Reveal message banner */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mx-4 -mt-2 mb-3 p-3 rounded-2xl bg-primary/10 border border-primary/15 text-center"
              >
                <p className="text-sm text-primary font-medium flex items-center justify-center gap-2">
                  <span className="text-lg">{revealMsg.emoji}</span>
                  {revealMsg.text}
                </p>
              </motion.div>

              {/* Profile info */}
              <div className="px-4 pb-5 space-y-3">
                {/* Vibe & Connection */}
                <div className="flex items-center gap-2 flex-wrap">
                  {vibeInfo && (
                    <span className="px-3 py-1.5 rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
                      {vibeInfo.emoji} {vibeInfo.label}
                    </span>
                  )}
                  <span className="px-3 py-1.5 rounded-full bg-accent/10 text-xs font-medium text-accent border border-accent/15">
                    <Heart className="w-3 h-3 inline mr-1" />
                    {profile.compatibility}% match
                  </span>
                </div>

                {/* Bio */}
                {profile.bio && (
                  <p className="text-sm text-foreground/80 leading-relaxed">{profile.bio}</p>
                )}

                {/* Personality prompt */}
                {profile.personalityPrompt && (
                  <p className="text-sm text-muted-foreground italic">"{profile.personalityPrompt}"</p>
                )}

                {/* Voice clip */}
                {profile.voiceClipUrl && (
                  <button
                    onClick={toggleVoice}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary/60 hover:bg-secondary transition-colors"
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${playingVoice ? "gradient-primary" : "bg-primary/10"}`}>
                      <Volume2 className={`w-4 h-4 ${playingVoice ? "text-primary-foreground" : "text-primary"}`} />
                    </div>
                    <span className="text-xs text-muted-foreground">Listen to voice intro</span>
                  </button>
                )}

                {/* Interests */}
                {profile.interests && profile.interests.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.interests.map((interest, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-full bg-secondary text-[11px] text-secondary-foreground">
                        {interest}
                      </span>
                    ))}
                  </div>
                )}

                {/* Connection meter */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                    <span>Connection strength</span>
                    <span className="font-medium text-foreground">{connectionScore}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <motion.div
                      className="h-full gradient-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${connectionScore}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
