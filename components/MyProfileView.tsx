import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/lib/appContext";
import { useAuth } from "@/lib/authContext";
import { Button } from "@/components/ui/button";
import { conversationVibes, interestTags } from "@/lib/mockData";
import {
  User, MapPin, Edit, LogOut, Camera, Search, Heart, Eye,
  Mic, Play, Pause, ChevronRight, Sparkles, Shield, Volume2
} from "lucide-react";
import PixelatedImage from "./PixelatedImage";

export default function MyProfileView() {
  const { myProfile, setStep, conversations, getActiveChats } = useApp();
  const { signOut } = useAuth();
  const [playingVoice, setPlayingVoice] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "stats">("profile");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (!myProfile) return null;

  const vibeInfo = conversationVibes.find(v => v.value === myProfile.vibe);
  const activeChats = getActiveChats();
  const totalMessages = conversations.reduce((sum, c) => sum + c.messages.length, 0);
  const avgScore = conversations.length > 0
    ? Math.round(conversations.reduce((sum, c) => sum + c.connectionScore, 0) / conversations.length)
    : 0;

  const toggleVoice = () => {
    if (!myProfile.voiceClipUrl) return;
    if (playingVoice) {
      audioRef.current?.pause();
      setPlayingVoice(false);
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio(myProfile.voiceClipUrl);
        audioRef.current.onended = () => setPlayingVoice(false);
      }
      audioRef.current.play();
      setPlayingVoice(true);
    }
  };

  const stats = [
    { label: "Active Chats", value: activeChats.length, icon: "💬" },
    { label: "Messages Sent", value: totalMessages, icon: "✉️" },
    { label: "Avg Connection", value: `${avgScore}%`, icon: "💫" },
    { label: "Matches", value: conversations.length, icon: "🔥" },
  ];

  const editSections = [
    { icon: User, label: "Basic Info", desc: "Name, age, bio", step: "profile-basics" as const },
    { icon: Camera, label: "Photos", desc: "Manage your photos", step: "profile-photos" as const },
    { icon: Search, label: "Preferences", desc: "Who you're looking for", step: "preferences" as const },
    { icon: MapPin, label: "Location", desc: "Update your area", step: "location" as const },
    { icon: Heart, label: "Matching Questions", desc: "Refine your matches", step: "questions" as const },
  ];

  return (
    <div className="pb-28 min-h-screen">
      {/* Hero Section */}
      <div className="relative h-72 overflow-hidden">
        {myProfile.photos[0] ? (
          <>
            <img
              src={myProfile.photos[0]}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <User className="w-20 h-20 text-muted-foreground" />
          </div>
        )}

        {/* Profile info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-end gap-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-primary/40 shadow-lg shadow-primary/20 shrink-0"
            >
              {myProfile.photos[0] ? (
                <img src={myProfile.photos[0]} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-secondary flex items-center justify-center">
                  <User className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
            </motion.div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-display font-bold text-foreground truncate">
                {myProfile.name}, {myProfile.age}
              </h1>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                <MapPin className="w-3.5 h-3.5" />
                <span className="truncate">{myProfile.location || "Location not set"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-2 space-y-4">
        {/* Tab switcher */}
        <div className="glass rounded-2xl p-1 flex gap-1">
          {(["profile", "stats"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab
                  ? "gradient-primary text-primary-foreground shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "profile" ? "Profile" : "Stats"}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "profile" ? (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {/* Bio & Vibe */}
              <div className="glass rounded-2xl p-4 space-y-3">
                {myProfile.bio && (
                  <p className="text-sm text-foreground/80 leading-relaxed">{myProfile.bio}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 rounded-full bg-secondary text-xs text-secondary-foreground font-medium">
                    {myProfile.gender === "male" ? "👨 Man" : myProfile.gender === "female" ? "👩 Woman" : "🌈 Other"}
                  </span>
                  {vibeInfo && (
                    <span className="px-3 py-1.5 rounded-full bg-primary/10 text-xs text-primary font-medium border border-primary/20">
                      {vibeInfo.emoji} {vibeInfo.label}
                    </span>
                  )}
                  <span className="px-3 py-1.5 rounded-full bg-secondary text-xs text-secondary-foreground font-medium">
                    {myProfile.lookingFor === "male" ? "Looking for Men" : myProfile.lookingFor === "female" ? "Looking for Women" : "Looking for Everyone"}
                  </span>
                </div>
              </div>

              {/* Voice Clip */}
              {myProfile.voiceClipUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-2xl p-4"
                >
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-primary" />
                    Voice Introduction
                  </h3>
                  <button
                    onClick={toggleVoice}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary/60 hover:bg-secondary transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      playingVoice ? "gradient-primary" : "bg-primary/10"
                    }`}>
                      {playingVoice ? (
                        <Pause className="w-4 h-4 text-primary-foreground" />
                      ) : (
                        <Play className="w-4 h-4 text-primary ml-0.5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex gap-0.5 items-center h-6">
                        {Array.from({ length: 24 }).map((_, i) => (
                          <motion.div
                            key={i}
                            className="w-1 rounded-full bg-primary/40"
                            animate={{
                              height: playingVoice
                                ? [4, Math.random() * 20 + 4, 4]
                                : Math.sin(i * 0.5) * 8 + 10,
                            }}
                            transition={{
                              duration: 0.4,
                              repeat: playingVoice ? Infinity : 0,
                              delay: i * 0.05,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">0:30</span>
                  </button>
                </motion.div>
              )}

              {/* Interests */}
              {myProfile.interests && myProfile.interests.length > 0 && (
                <div className="glass rounded-2xl p-4">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-accent" />
                    Interests
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {myProfile.interests.map((interest, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="px-3 py-1.5 rounded-full bg-accent/10 text-xs text-accent border border-accent/15 font-medium"
                      >
                        {interest}
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}

              {/* Photo Gallery */}
              {myProfile.photos.filter(Boolean).length > 1 && (
                <div className="glass rounded-2xl p-4">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-primary" />
                    Photos
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {myProfile.photos.filter(Boolean).map((photo, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="aspect-square rounded-xl overflow-hidden ring-1 ring-border/50"
                      >
                        <img src={photo} alt="" className="w-full h-full object-cover" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview */}
              <div className="glass rounded-2xl p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-primary" />
                  How others see you
                </h3>
                <div className="flex items-center gap-4">
                  {myProfile.photos[0] && (
                    <div className="w-24 h-24 rounded-xl overflow-hidden ring-2 ring-primary/10 shrink-0">
                      <PixelatedImage
                        src={myProfile.photos[0]}
                        compatibility={25}
                        width={96}
                        height={96}
                      />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Your photo starts pixelated and reveals as the conversation deepens 🔮
                    </p>
                    <div className="flex gap-1">
                      {[10, 30, 60, 100].map(pct => (
                        <div key={pct} className="flex-1 text-center">
                          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                            <div
                              className="h-full gradient-primary rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[9px] text-muted-foreground mt-1">{pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="stats"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass rounded-2xl p-4 text-center"
                  >
                    <span className="text-2xl">{stat.icon}</span>
                    <p className="text-2xl font-display font-bold text-foreground mt-1">{stat.value}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Connection Quality */}
              <div className="glass rounded-2xl p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-primary" />
                  Connection Quality
                </h3>
                <div className="space-y-3">
                  {conversations.slice(0, 4).map(conv => (
                    <div key={conv.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-border/50 shrink-0">
                        <PixelatedImage
                          src={conv.user.image}
                          compatibility={conv.revealLevel}
                          width={32}
                          height={32}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{conv.user.name}</p>
                        <div className="h-1.5 rounded-full bg-secondary mt-1 overflow-hidden">
                          <motion.div
                            className="h-full gradient-primary rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${conv.connectionScore}%` }}
                            transition={{ duration: 1, delay: 0.3 }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">{conv.connectionScore}%</span>
                    </div>
                  ))}
                  {conversations.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      Start chatting to see your connection stats ✨
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit sections */}
        <div className="glass rounded-2xl p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
            <Edit className="w-4 h-4 text-muted-foreground" />
            Edit Profile
          </h3>
          <div className="space-y-1.5">
            {editSections.map((section, i) => (
              <motion.button
                key={section.step}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setStep(section.step)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary/40 hover:bg-secondary/70 transition-colors text-left group"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <section.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-foreground">{section.label}</span>
                  <p className="text-[11px] text-muted-foreground">{section.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </motion.button>
            ))}
          </div>
        </div>

        {/* Sign Out */}
        <Button
          variant="secondary"
          className="w-full rounded-xl h-12"
          onClick={() => signOut()}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
