import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, CheckCircle2, ChevronRight, Sparkles, Trophy } from "lucide-react";

export interface Mission {
  id: string;
  title: string;
  prompt: string;
  emoji: string;
  keywords: string[];
}

const MISSIONS: Mission[] = [
  {
    id: "shared-hobby",
    title: "Common Ground",
    prompt: "Find one hobby you both share",
    emoji: "🎯",
    keywords: ["hobby", "hobbies", "both", "same", "too", "me too", "also", "love", "enjoy"],
  },
  {
    id: "childhood-memory",
    title: "Memory Lane",
    prompt: "Ask about a favorite childhood memory",
    emoji: "🧒",
    keywords: ["childhood", "remember", "grew up", "kid", "young", "memory", "memories", "school"],
  },
  {
    id: "ideal-weekend",
    title: "Weekend Vibes",
    prompt: "Describe your ideal weekend",
    emoji: "☀️",
    keywords: ["weekend", "saturday", "sunday", "morning", "relax", "ideal", "perfect day"],
  },
  {
    id: "dream-date",
    title: "Dream Date",
    prompt: "Plan your dream first date together",
    emoji: "💫",
    keywords: ["date", "meet", "restaurant", "coffee", "dinner", "together", "go to", "let's"],
  },
  {
    id: "lose-track",
    title: "In The Zone",
    prompt: "Ask: What makes you lose track of time?",
    emoji: "⏳",
    keywords: ["time", "hours", "lose track", "passionate", "obsessed", "into", "focus"],
  },
  {
    id: "bucket-list",
    title: "Bucket List",
    prompt: "Share one thing on your bucket list",
    emoji: "✈️",
    keywords: ["bucket", "dream", "travel", "want to", "wish", "someday", "goal", "always wanted"],
  },
  {
    id: "music-taste",
    title: "Soundtrack",
    prompt: "What song describes your personality?",
    emoji: "🎵",
    keywords: ["song", "music", "playlist", "artist", "band", "listen", "genre", "concert"],
  },
  {
    id: "superpower",
    title: "Superpower",
    prompt: "If you had a superpower, what would it be?",
    emoji: "⚡",
    keywords: ["superpower", "power", "fly", "invisible", "teleport", "ability", "magic"],
  },
];

interface ConversationMissionsProps {
  conversationId: string;
  messages: { senderId: string; text: string }[];
  onMissionComplete: (bonusScore: number, bonusReveal: number) => void;
}

export default function ConversationMissions({
  conversationId,
  messages,
  onMissionComplete,
}: ConversationMissionsProps) {
  const [completedMissions, setCompletedMissions] = useState<Record<string, string[]>>({});
  const [justCompleted, setJustCompleted] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const completed = completedMissions[conversationId] || [];
  const currentMissionIndex = Math.min(completed.length, MISSIONS.length - 1);
  const currentMission = completed.length < MISSIONS.length ? MISSIONS[currentMissionIndex] : null;
  const allDone = completed.length >= MISSIONS.length;

  // Check mission completion based on recent messages
  const checkMissionCompletion = useCallback(() => {
    if (!currentMission || messages.length < 2) return;

    // Only check user messages from the last few exchanges
    const recentMessages = messages.slice(-6);
    const recentText = recentMessages.map((m) => m.text.toLowerCase()).join(" ");

    const matched = currentMission.keywords.some((kw) => recentText.includes(kw.toLowerCase()));

    if (matched && !completed.includes(currentMission.id)) {
      setCompletedMissions((prev) => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), currentMission.id],
      }));
      setJustCompleted(currentMission.id);
      setShowCelebration(true);
      onMissionComplete(10, 10);

      setTimeout(() => {
        setShowCelebration(false);
        setJustCompleted(null);
      }, 3500);
    }
  }, [currentMission, messages, completed, conversationId, onMissionComplete]);

  useEffect(() => {
    checkMissionCompletion();
  }, [messages.length]);

  return (
    <div className="mx-4 mb-2">
      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && justCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            className="mb-2 p-3 rounded-2xl bg-success/10 border border-success/20 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ rotate: -20, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
                className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center shrink-0"
              >
                <CheckCircle2 className="w-5 h-5 text-success" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xs font-semibold text-success"
                >
                  ✨ Mission completed!
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-[11px] text-success/80"
                >
                  Connection level +10% • Photo reveal +10%
                </motion.p>
              </div>
              <motion.div
                animate={{ rotate: [0, 15, -15, 10, -10, 0] }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Trophy className="w-5 h-5 text-success/60" />
              </motion.div>
            </div>

            {/* Next mission teaser */}
            {currentMissionIndex + 1 < MISSIONS.length && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ delay: 0.5 }}
                className="mt-2 pt-2 border-t border-success/10 flex items-center gap-2"
              >
                <span className="text-[10px] text-muted-foreground">
                  Mission {completed.length + 1} unlocked →
                </span>
                <span className="text-[10px] font-medium text-foreground/70">
                  {MISSIONS[currentMissionIndex + 1]?.emoji} {MISSIONS[currentMissionIndex + 1]?.title}
                </span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current mission card */}
      {!showCelebration && currentMission && (
        <motion.div
          key={currentMission.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-2xl bg-card border border-border/30 backdrop-blur-sm"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Target className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                  Mission {completed.length + 1}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {currentMission.emoji} {currentMission.title}
                </span>
              </div>
              <p className="text-xs text-foreground/80 leading-relaxed">
                "{currentMission.prompt}"
              </p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0 mt-1" />
          </div>

          {/* Progress dots */}
          <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-border/20">
            {MISSIONS.slice(0, 5).map((m, i) => (
              <motion.div
                key={m.id}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  completed.includes(m.id)
                    ? "bg-success"
                    : i === completed.length
                    ? "bg-primary/50"
                    : "bg-muted"
                }`}
                initial={false}
                animate={
                  completed.includes(m.id) ? { scale: [1, 1.3, 1] } : {}
                }
                transition={{ duration: 0.3 }}
              />
            ))}
            {MISSIONS.length > 5 && (
              <span className="text-[9px] text-muted-foreground ml-0.5">
                +{MISSIONS.length - 5}
              </span>
            )}
          </div>
        </motion.div>
      )}

      {/* All missions done */}
      {!showCelebration && allDone && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 rounded-2xl bg-success/5 border border-success/20 text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-success" />
            <span className="text-xs font-semibold text-success">All missions completed!</span>
            <Sparkles className="w-4 h-4 text-success" />
          </div>
          <p className="text-[11px] text-muted-foreground">
            You two have built a real connection 💕
          </p>
        </motion.div>
      )}
    </div>
  );
}
