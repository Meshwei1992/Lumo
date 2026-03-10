import { useState } from "react";
import { motion } from "framer-motion";
import { UserProfile, conversationVibes } from "@/lib/mockData";
import { MessageCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import PartialRevealImage from "./PartialRevealImage";

interface MatchCardProps {
  profile: UserProfile;
  onStartChat: (profile: UserProfile) => void;
  index: number;
}

function getCardScale(compatibility: number): number {
  if (compatibility >= 90) return 1.05;
  if (compatibility >= 80) return 1.02;
  return 1;
}

export default function MatchCard({ profile, onStartChat, index }: MatchCardProps) {
  const vibeInfo = conversationVibes.find(v => v.value === profile.vibe);
  const revealPercent = Math.min(100, profile.compatibility * 0.6);
  const scale = getCardScale(profile.compatibility);
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, scale }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ scale: scale * 1.02 }}
      className="glass rounded-2xl overflow-hidden origin-center"
    >
      <div
        className="relative h-64 overflow-hidden cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onTouchStart={() => setHovered(true)}
        onTouchEnd={() => setHovered(false)}
      >
        <PartialRevealImage
          src={profile.image}
          revealLevel={revealPercent}
          hoverBoost={hovered}
          className="w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none" />

        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium backdrop-blur-md bg-background/30 text-foreground/80 border border-border/20">
          <Eye className="w-3 h-3" />
          {Math.round(revealPercent)}%
        </div>

        <div className="absolute bottom-0 inset-x-0 p-3">
          <h3 className="text-lg font-display font-bold text-foreground">
            {profile.name}, {profile.age}
          </h3>
          {profile.location && (
            <p className="text-[11px] text-foreground/50 font-normal mt-0.5">{profile.location}</p>
          )}
        </div>
      </div>

      <div className="px-3 pb-3 pt-2.5 flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {vibeInfo && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary/10 text-primary border border-primary/10">
              {vibeInfo.emoji} {vibeInfo.label}
            </span>
          )}
          {profile.interests?.slice(0, 3).map((interest, i) => (
            <span key={i} className="px-2 py-0.5 rounded-full text-[11px] bg-secondary text-secondary-foreground">
              {interest}
            </span>
          ))}
        </div>

        <Button
          onClick={() => onStartChat(profile)}
          size="sm"
          className="w-full gradient-primary border-0 rounded-xl h-9 text-xs"
        >
          <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
          Start conversation
        </Button>
      </div>
    </motion.div>
  );
}
