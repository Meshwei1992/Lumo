import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserProfile } from "@/lib/mockData";
import { X, Send, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SUGGESTED_OPENERS = [
  "What makes you lose track of time?",
  "What does your perfect weekend look like?",
  "What always makes you laugh?",
  "If you could teleport anywhere right now, where would you go?",
  "What's something you're secretly passionate about?",
  "What's the best trip you've ever taken?",
  "What's one thing on your bucket list?",
  "What song best describes your personality?",
];

interface ConversationStartModalProps {
  profile: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSend: (profile: UserProfile, message: string) => void;
}

export default function ConversationStartModal({
  profile,
  isOpen,
  onClose,
  onSend,
}: ConversationStartModalProps) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!profile || !text.trim()) return;
    onSend(profile, text.trim());
    setText("");
  };

  const handleSuggest = () => {
    const random = SUGGESTED_OPENERS[Math.floor(Math.random() * SUGGESTED_OPENERS.length)];
    setText(random);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => setText(""), 300);
  };

  if (!profile) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: "spring", damping: 28, stiffness: 350 }}
            className="fixed bottom-16 inset-x-0 z-50"
          >
            <div className="mx-3 mb-3 rounded-2xl bg-card border border-border/30 shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-primary/20">
                    <img
                      src={profile.image}
                      alt=""
                      className="w-full h-full object-cover"
                      style={{ filter: "blur(8px)" }}
                    />
                  </div>
                  <p className="text-sm font-semibold">{profile.name}</p>
                </div>
                <button
                  onClick={handleClose}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>

              {/* Input area */}
              <div className="px-3 pb-3 flex items-center gap-2">
                <button
                  onClick={handleSuggest}
                  className="w-9 h-9 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors flex items-center justify-center shrink-0"
                  title="Get a conversation idea"
                >
                  <Lightbulb className="w-4 h-4 text-primary" />
                </button>
                <Input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Write your first message..."
                  className="flex-1 rounded-xl bg-secondary border-0 h-9 text-sm"
                  autoFocus
                />
                <Button
                  onClick={handleSend}
                  disabled={!text.trim()}
                  size="icon"
                  className="gradient-primary border-0 rounded-xl h-9 w-9 shrink-0 disabled:opacity-30"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
