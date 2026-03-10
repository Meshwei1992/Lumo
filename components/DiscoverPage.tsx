import { useState, useMemo } from "react";
import { useApp } from "@/lib/appContext";
import MatchCard from "./MatchCard";
import { UserProfile } from "@/lib/mockData";
import { toast } from "@/components/ui/sonner";
import { motion } from "framer-motion";
import { Eye, Compass } from "lucide-react";
import ConversationStartModal from "./ConversationStartModal";
import { buildDiscoverFeed } from "@/lib/matchScoring";

export default function DiscoverPage() {
  const { matches, startChat, getActiveChats, maxChats, myProfile, userAnswers } = useApp();
  const activeCount = getActiveChats().length;
  const [modalProfile, setModalProfile] = useState<UserProfile | null>(null);

  const feed = useMemo(
    () => buildDiscoverFeed(myProfile, userAnswers, matches),
    [myProfile, userAnswers, matches]
  );

  const handleOpenModal = (profile: UserProfile) => {
    if (activeCount >= maxChats) {
      toast.error(`You can only chat with ${maxChats} people at a time. End a conversation to start a new one.`);
      return;
    }
    setModalProfile(profile);
  };

  const handleSendAndStart = (profile: UserProfile, message: string) => {
    const success = startChat(profile, message);
    if (!success) {
      toast.error("You already have an active chat with this person");
    }
    setModalProfile(null);
  };

  return (
    <div className="p-4 pb-24">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Compass className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-display font-bold">Discover</h1>
        </div>
        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5" />
          Photos reveal as conversations progress
        </p>
        <p className="text-xs text-muted-foreground/60 mt-0.5">
          Active chats: {activeCount}/{maxChats}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {feed.map((profile, idx) => (
          <MatchCard
            key={profile.id}
            profile={{ ...profile, compatibility: profile.matchScore }}
            onStartChat={handleOpenModal}
            index={idx}
          />
        ))}
      </div>

      <ConversationStartModal
        profile={modalProfile}
        isOpen={!!modalProfile}
        onClose={() => setModalProfile(null)}
        onSend={handleSendAndStart}
      />
    </div>
  );
}
