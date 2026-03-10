import { useApp } from "@/lib/appContext";
import { Compass, MessageCircle, MapPin, User } from "lucide-react";
import { motion } from "framer-motion";

const tabs = [
  { id: "discover" as const, icon: Compass, label: "Discover" },
  { id: "chats" as const, icon: MessageCircle, label: "Chats" },
  { id: "date-spots" as const, icon: MapPin, label: "Spots" },
  { id: "my-profile" as const, icon: User, label: "Profile" },
];

export default function BottomNav() {
  const { currentStep, setStep, getActiveChats } = useApp();
  const activeCount = getActiveChats().length;

  return (
    <div className="fixed bottom-0 left-0 right-0 glass border-t border-border/50 z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = currentStep === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setStep(tab.id)}
              className="relative flex flex-col items-center gap-0.5 px-3 py-2"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-0.5 w-8 h-1 gradient-primary rounded-full"
                />
              )}
              <tab.icon
                className={`w-5 h-5 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              />
              {tab.id === "chats" && activeCount > 0 && (
                <span className="absolute -top-0.5 right-1 w-4 h-4 gradient-primary rounded-full text-[10px] text-primary-foreground flex items-center justify-center font-bold">
                  {activeCount}
                </span>
              )}
              <span
                className={`text-[10px] font-medium ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
