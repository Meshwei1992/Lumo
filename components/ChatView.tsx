import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/lib/appContext";
import { getRandomDisconnectMessage, getGhostingPenalty, conversationStarters } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, X, MapPin, ArrowLeft, TrendingUp, Lightbulb, Eye, Sparkles, Loader2, Smile, Check, CheckCheck, MessageCircle, Camera, Gamepad2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import ConnectionMeter from "./ConnectionMeter";
import { supabase } from "@/integrations/supabase/client";
import MatchProfilePopup from "./MatchProfilePopup";
import PixelatedImage from "./PixelatedImage";
import { getNextRevealCategory, getRevealedCategories, CATEGORY_CONFIG } from "@/lib/photoCategories";
import ConversationMissions from "./ConversationMissions";
import ChatGames from "./ChatGames";

const EMOJI_LIST = [
  "😊", "😂", "❤️", "🥰", "😍", "🤗", "😘", "💕",
  "✨", "🔥", "💫", "🌹", "😄", "🤔", "👋", "💪",
  "🎉", "🌙", "☺️", "😏", "💖", "🙈", "😇", "🤩",
  "💬", "🫶", "💐", "🎵", "☕", "🍷", "🌊", "🦋",
];

const CONVERSATION_PROMPTS = [
  "What makes you lose track of time?",
  "If you could live anywhere for a year, where would it be?",
  "What song describes your personality?",
  "What's the best trip you've ever taken?",
  "What's something you're secretly passionate about?",
  "What's your ideal Sunday morning?",
];

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex justify-start"
    >
      <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-muted-foreground/50"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

function ReadReceipt({ status }: { status: "sent" | "delivered" | "read" }) {
  return (
    <span className="flex items-center gap-0.5 ml-1">
      {status === "sent" && <Check className="w-3 h-3 text-muted-foreground/40" />}
      {status === "delivered" && <CheckCheck className="w-3 h-3 text-muted-foreground/40" />}
      {status === "read" && <CheckCheck className="w-3 h-3 text-primary" />}
    </span>
  );
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatView() {
  const { conversations, getActiveChats, sendMessage, disconnectChat, setStep, updateConversationScore } = useApp();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [_lastRevealNotification, _setLastRevealNotification] = useState<Record<string, number>>({});
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [showEmojis, setShowEmojis] = useState(false);
  const [showMatchProfile, setShowMatchProfile] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [chatMode, setChatMode] = useState<"chat" | "play">("chat");
  const [showStarters, setShowStarters] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeChats = getActiveChats();

  const selectedConversation = conversations.find((c) => c.id === selectedChat);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConversation?.messages]);

  // Show typing indicator before bot replies
  useEffect(() => {
    if (!selectedConversation) return;
    const msgs = selectedConversation.messages;
    const lastMsg = msgs[msgs.length - 1];
    if (lastMsg?.senderId === "me") {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 1400);
      return () => clearTimeout(timer);
    }
    setIsTyping(false);
  }, [selectedConversation?.messages.length]);

  // AI analyze conversation
  const analyzeConversation = useCallback(async () => {
    if (!selectedConversation || selectedConversation.messages.length < 4) return;
    if (selectedConversation.messages.length % 5 !== 0) return;

    setAiAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-conversation", {
        body: { messages: selectedConversation.messages },
      });

      if (error) throw error;

      if (data.score && data.revealBonus > 0) {
        updateConversationScore(selectedConversation.id, data.score, data.revealBonus);
        if (data.feedback) {
          setAiFeedback(data.feedback);
          setTimeout(() => setAiFeedback(null), 4000);
        }
      }
    } catch (error) {
      console.error("AI analysis error:", error);
    } finally {
      setAiAnalyzing(false);
    }
  }, [selectedConversation, updateConversationScore]);

  useEffect(() => {
    analyzeConversation();
  }, [selectedConversation?.messages.length]);

  // Reveal notifications - now category-based
  const [lastRevealedCategories, setLastRevealedCategories] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!selectedConversation) return;
    const currentReveal = selectedConversation.revealLevel;
    const prevRevealed = lastRevealedCategories[selectedConversation.id] || [];
    const nowRevealed = getRevealedCategories(currentReveal);
    
    const newlyRevealed = nowRevealed.filter((c) => !prevRevealed.includes(c));
    if (newlyRevealed.length > 0) {
      const latest = newlyRevealed[newlyRevealed.length - 1];
      const config = CATEGORY_CONFIG[latest];
      toast(`✨ New photo unlocked: ${config.emoji} ${config.label}`, { duration: 4000 });
      setLastRevealedCategories((prev) => ({
        ...prev,
        [selectedConversation.id]: nowRevealed,
      }));
    }
  }, [selectedConversation?.revealLevel]);

  const handleSend = () => {
    if (!inputText.trim() || !selectedChat) return;
    sendMessage(selectedChat, inputText);
    setInputText("");
    setShowEmojis(false);
    setShowStarters(false);
  };

  const insertEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
  };

  const handleDisconnect = (convId: string) => {
    const msg = getRandomDisconnectMessage();
    disconnectChat(convId);
    toast(msg, { duration: 4000 });
    setSelectedChat(null);
  };

  const useStarter = (prompt: string) => {
    setInputText(prompt);
    setShowStarters(false);
  };

  // ── Empty state ──
  if (activeChats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mb-4"
        >
          <MessageCircle className="w-8 h-8 text-primary-foreground" />
        </motion.div>
        <h2 className="text-xl font-display font-bold mb-2">No active chats</h2>
        <p className="text-muted-foreground mb-1 text-sm">Start a conversation with someone interesting</p>
        <p className="text-muted-foreground/60 mb-4 text-xs">Photos reveal as your connection grows 🔮</p>
        <Button onClick={() => setStep("discover")} className="gradient-primary border-0 rounded-xl">
          Find matches
        </Button>
      </div>
    );
  }

  // ── Chat list ──
  if (!selectedConversation) {
    return (
      <div className="p-4 pb-24">
        <h1 className="text-2xl font-display font-bold mb-1">Messages</h1>
        <p className="text-xs text-muted-foreground mb-4">Photos reveal as conversations deepen ✨</p>
        <div className="space-y-2">
          {activeChats.map((conv) => {
            const ghostPenalty = getGhostingPenalty(conv.lastActivity);
            const effectiveReveal = Math.max(0, conv.revealLevel - ghostPenalty);
            const lastMsg = conv.messages[conv.messages.length - 1];
            const filledSegments = Math.round((conv.connectionScore / 100) * 5);

            return (
              <motion.button
                key={conv.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedChat(conv.id)}
                className="w-full rounded-2xl bg-card p-3.5 flex items-center gap-3 text-left border border-border/30 hover:border-primary/20 transition-colors"
              >
                {/* Blurred avatar */}
                <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 ring-2 ring-border/50">
                  <img
                    src={conv.user.image}
                    alt=""
                    className="w-full h-full object-cover"
                    style={{ filter: `blur(${Math.max(0, 12 - effectiveReveal / 8)}px)` }}
                  />
                  {effectiveReveal >= 60 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-success/10">
                      <Eye className="w-3 h-3 text-success" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{conv.user.name}</span>
                      {conv.connectionScore > 30 && (
                        <TrendingUp className="w-3 h-3 text-success" />
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {lastMsg ? formatTime(lastMsg.timestamp) : ""}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mb-1.5">
                    {lastMsg?.senderId === "me" && "You: "}
                    {lastMsg?.text || "Start chatting!"}
                  </p>
                  {/* Connection bar */}
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5 flex-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            i < filledSegments ? "bg-primary" : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-medium text-primary/70">
                      {effectiveReveal}%
                    </span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Active chat ──
  const ghostPenalty = getGhostingPenalty(selectedConversation.lastActivity);
  const effectiveReveal = Math.max(0, selectedConversation.revealLevel - ghostPenalty);
  const chatBlur = Math.max(0, 12 - effectiveReveal / 8);
  const nextReveal = getNextRevealCategory(effectiveReveal);

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] bg-background">
      {/* ── Header ── */}
      <div className="bg-card/80 backdrop-blur-xl px-3 py-3 flex items-center gap-3 border-b border-border/30">
        <Button variant="ghost" size="icon" onClick={() => setSelectedChat(null)} className="shrink-0 h-8 w-8">
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <button
          onClick={() => setShowMatchProfile(true)}
          className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-primary/20 hover:ring-primary/40 transition-all"
        >
          <img
            src={selectedConversation.user.image}
            alt=""
            className="w-full h-full object-cover"
            style={{ filter: `blur(${chatBlur}px)` }}
          />
        </button>

        <button onClick={() => setShowMatchProfile(true)} className="flex-1 text-left min-w-0">
          <span className="font-semibold text-sm block">{selectedConversation.user.name}</span>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span>Photo reveal: {effectiveReveal}%</span>
            {nextReveal && (
              <span className="text-primary/70 flex items-center gap-0.5">
                • Next: {nextReveal.emoji} {nextReveal.threshold}%
              </span>
            )}
            {aiAnalyzing && (
              <span className="text-accent flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Analyzing...
              </span>
            )}
          </div>
        </button>

        <Button variant="ghost" size="sm" onClick={() => setStep("date-spots")} className="text-accent text-xs h-8 px-2">
          <MapPin className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleDisconnect(selectedConversation.id)}
          className="text-destructive/60 hover:text-destructive shrink-0 h-8 w-8"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* ── Chat / Play Toggle ── */}
      <div className="flex items-center bg-card/60 border-b border-border/20">
        <button
          onClick={() => setChatMode("chat")}
          className={`flex-1 py-2.5 text-xs font-medium text-center transition-colors flex items-center justify-center gap-1.5 ${
            chatMode === "chat" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
          }`}
        >
          <MessageCircle className="w-3.5 h-3.5" /> Chat
        </button>
        <button
          onClick={() => setChatMode("play")}
          className={`flex-1 py-2.5 text-xs font-medium text-center transition-colors flex items-center justify-center gap-1.5 ${
            chatMode === "play" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
          }`}
        >
          <Gamepad2 className="w-3.5 h-3.5" /> Play
        </button>
      </div>

      {/* ── Connection Meter ── */}
      <ConnectionMeter score={selectedConversation.connectionScore} revealPercent={effectiveReveal} />

      {chatMode === "play" ? (
        /* ── Play Mode ── */
        <ChatGames
          matchName={selectedConversation.user.name}
          onReward={(scoreBonus, revealBonus) => {
            updateConversationScore(
              selectedConversation.id,
              selectedConversation.connectionScore + scoreBonus,
              revealBonus
            );
          }}
          onClose={() => setChatMode("chat")}
        />
      ) : (
        <>
          {/* ── AI Feedback Banner ── */}
          <AnimatePresence>
            {aiFeedback && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="mx-4 mb-1 overflow-hidden"
              >
                <div className="px-4 py-2.5 rounded-xl bg-success/10 border border-success/20 text-xs text-success text-center flex items-center justify-center gap-2 font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  {aiFeedback}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Ghost warning ── */}
          {ghostPenalty > 0 && (
            <div className="mx-4 mb-1 px-4 py-2 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive text-center">
              ⚠️ Chat inactive — photo is re-blurring! Send a message to stop
            </div>
          )}

          {/* ── Conversation Missions ── */}
          <ConversationMissions
            conversationId={selectedConversation.id}
            messages={selectedConversation.messages}
            onMissionComplete={(bonusScore, bonusReveal) => {
              updateConversationScore(selectedConversation.id,
                selectedConversation.connectionScore + bonusScore,
                bonusReveal
              );
            }}
          />

          {/* ── Blurred Photo Preview with Next Reveal ── */}
          {selectedConversation.messages.length <= 3 && (
            <div className="mx-4 mb-2 flex items-center gap-3 p-3 rounded-xl bg-card border border-border/30">
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                <img
                  src={selectedConversation.user.image}
                  alt=""
                  className="w-full h-full object-cover"
                  style={{ filter: `blur(${chatBlur}px)` }}
                />
              </div>
              <div className="flex-1 min-w-0">
                {nextReveal ? (
                  <p className="text-xs font-medium text-foreground/80 mb-1 flex items-center gap-1">
                    <Camera className="w-3 h-3 text-primary" />
                    Next reveal: {nextReveal.emoji} {nextReveal.label} at {nextReveal.threshold}%
                  </p>
                ) : (
                  <p className="text-xs font-medium text-foreground/80 mb-1">
                    Keep chatting to reveal {selectedConversation.user.name}'s photo
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full rounded-full gradient-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${effectiveReveal}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-primary">{effectiveReveal}%</span>
                </div>
              </div>
            </div>
          )}

          {/* ── Messages ── */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5">
            <AnimatePresence>
              {selectedConversation.messages.map((msg, idx) => {
                const isMe = msg.senderId === "me";
                const isSystem = msg.senderId === "system";
                const isLast = idx === selectedConversation.messages.length - 1;
                const prevMsg = idx > 0 ? selectedConversation.messages[idx - 1] : null;
                const sameGroup = prevMsg && prevMsg.senderId === msg.senderId;

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${isMe ? "justify-end" : isSystem ? "justify-center" : "justify-start"} ${
                      !sameGroup ? "mt-3" : ""
                    }`}
                  >
                    {isSystem ? (
                      <div className="px-4 py-2 rounded-full text-[11px] text-muted-foreground bg-muted/40 max-w-[85%] text-center">
                        {msg.text}
                      </div>
                    ) : (
                      <div className="flex flex-col items-end gap-0.5 max-w-[78%]">
                        <div
                          className={`px-4 py-2.5 text-sm leading-relaxed ${
                            isMe
                              ? "gradient-primary text-primary-foreground rounded-2xl rounded-br-md"
                              : "bg-secondary text-secondary-foreground rounded-2xl rounded-bl-md"
                          }`}
                        >
                          {msg.text}
                        </div>
                        {/* Timestamp + read receipt */}
                        {(isLast || !sameGroup) && (
                          <div className={`flex items-center gap-0.5 px-1 ${isMe ? "" : "self-start"}`}>
                            <span className="text-[10px] text-muted-foreground/40">
                              {formatTime(msg.timestamp)}
                            </span>
                            {isMe && (
                              <ReadReceipt
                                status={
                                  isLast && isTyping ? "delivered" : isLast ? "read" : "read"
                                }
                              />
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Typing indicator */}
            <AnimatePresence>{isTyping && <TypingIndicator />}</AnimatePresence>

            <div ref={messagesEndRef} />
          </div>

          {/* ── Conversation Starters ── */}
          <AnimatePresence>
            {showStarters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-t border-border/20"
              >
                <div className="p-3 bg-card/90 backdrop-blur-xl">
                  <p className="text-[11px] text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Lightbulb className="w-3 h-3 text-accent" />
                    Conversation starters
                  </p>
                  <div className="space-y-1.5">
                    {CONVERSATION_PROMPTS.slice(0, 4).map((prompt) => (
                      <motion.button
                        key={prompt}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => useStarter(prompt)}
                        className="w-full text-left text-xs px-3 py-2.5 rounded-xl bg-secondary/60 hover:bg-secondary text-secondary-foreground transition-colors border border-border/20"
                      >
                        "{prompt}"
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Emoji picker ── */}
          <AnimatePresence>
            {showEmojis && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-t border-border/20"
              >
                <div className="p-3 bg-card/90 backdrop-blur-xl grid grid-cols-8 gap-1.5">
                  {EMOJI_LIST.map((emoji) => (
                    <motion.button
                      key={emoji}
                      whileTap={{ scale: 0.85 }}
                      onClick={() => insertEmoji(emoji)}
                      className="aspect-square rounded-lg flex items-center justify-center text-lg hover:bg-secondary/60 transition-colors"
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Input bar ── */}
          <div className="px-3 py-2.5 bg-card/80 backdrop-blur-xl border-t border-border/30">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => { setShowStarters(!showStarters); setShowEmojis(false); }}
                className={`shrink-0 h-8 w-8 ${showStarters ? "text-accent" : "text-muted-foreground"}`}
              >
                <Lightbulb className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => { setShowEmojis(!showEmojis); setShowStarters(false); }}
                className={`shrink-0 h-8 w-8 ${showEmojis ? "text-primary" : "text-muted-foreground"}`}
              >
                <Smile className="w-4 h-4" />
              </Button>
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message..."
                className="flex-1 rounded-full bg-secondary border-0 h-9 text-sm px-4"
                onFocus={() => { setShowEmojis(false); setShowStarters(false); }}
              />
              <Button
                onClick={handleSend}
                disabled={!inputText.trim()}
                size="icon"
                className="gradient-primary border-0 rounded-full shrink-0 h-9 w-9 disabled:opacity-30"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* ── Match Profile Popup ── */}
      <MatchProfilePopup
        profile={selectedConversation.user}
        revealLevel={effectiveReveal}
        connectionScore={selectedConversation.connectionScore}
        isOpen={showMatchProfile}
        onClose={() => setShowMatchProfile(false)}
      />
    </div>
  );
}
