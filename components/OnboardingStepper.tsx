import { motion } from "framer-motion";
import { useApp } from "@/lib/appContext";
import { User, Camera, Search, MapPin, HelpCircle, Check } from "lucide-react";

const steps = [
  { id: "profile-basics" as const, icon: User, label: "Basics" },
  { id: "profile-photos" as const, icon: Camera, label: "Photos" },
  { id: "preferences" as const, icon: Search, label: "Preferences" },
  { id: "location" as const, icon: MapPin, label: "Location" },
  { id: "questions" as const, icon: HelpCircle, label: "Questions" },
];

export default function OnboardingStepper() {
  const { currentStep, setStep } = useApp();
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="w-full max-w-md mx-auto mb-6 px-4">
      <div className="flex items-center justify-between">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = step.id === currentStep;
          const isDone = idx < currentIndex;
          const isLast = idx === steps.length - 1;

          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setStep(step.id)}
                className="flex flex-col items-center gap-1 z-10 relative"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? "gradient-primary text-primary-foreground shadow-lg scale-110"
                      : isDone
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span
                  className={`text-[10px] font-medium transition-colors ${
                    isActive ? "text-primary" : isDone ? "text-primary/80" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </motion.button>
              
              {/* Connector line between steps */}
              {!isLast && (
                <div className="flex-1 h-0.5 mx-1 relative">
                  <div className="absolute inset-0 bg-secondary rounded-full" />
                  <motion.div 
                    className="absolute inset-y-0 left-0 bg-primary rounded-full"
                    initial={false}
                    animate={{ width: isDone ? "100%" : "0%" }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
