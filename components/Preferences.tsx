import { useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "@/lib/appContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Search } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import OnboardingStepper from "./OnboardingStepper";

export default function Preferences() {
  const { setStep, updateMyProfile, myProfile } = useApp();
  const [lookingFor, setLookingFor] = useState<"male" | "female" | "both" | "">(myProfile?.lookingFor || "");
  const [ageRange, setAgeRange] = useState<[number, number]>(myProfile?.ageRange || [20, 35]);
  const [maxDistance, setMaxDistance] = useState(myProfile?.maxDistance || 25);

  const options = [
    { value: "male" as const, label: "Men 👨" },
    { value: "female" as const, label: "Women 👩" },
    { value: "both" as const, label: "Everyone 🌈" },
  ];

  const handleNext = () => {
    if (!lookingFor) return;
    updateMyProfile({ lookingFor, ageRange, maxDistance });
    setStep("location");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 pt-8">
      <OnboardingStepper />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary mb-4">
            <Search className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold text-gradient mb-2">What are you looking for?</h1>
          <p className="text-sm text-muted-foreground">Tell us your preferences</p>
        </div>

        <div className="glass rounded-2xl p-6 space-y-6">
          <div>
            <label className="text-sm font-medium text-foreground/80 mb-3 block">Interested in:</label>
            <div className="grid grid-cols-3 gap-2">
              {options.map((opt) => (
                <motion.button key={opt.value} whileTap={{ scale: 0.95 }} onClick={() => setLookingFor(opt.value)}
                  className={`p-4 rounded-xl text-center text-sm font-medium transition-all ${lookingFor === opt.value ? "gradient-primary text-primary-foreground shadow-md" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
                >
                  {opt.label}
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground/80 mb-3 block">Age range: {ageRange[0]} - {ageRange[1]}</label>
            <div className="px-2 flex items-center gap-4">
              <span className="text-xs text-muted-foreground w-6 shrink-0">{ageRange[0]}</span>
              <Slider value={[ageRange[0]]} onValueChange={([val]) => setAgeRange([val, Math.max(val, ageRange[1])])} min={18} max={60} step={1} className="flex-1" />
              <span className="text-xs text-muted-foreground mx-1">—</span>
              <Slider value={[ageRange[1]]} onValueChange={([val]) => setAgeRange([Math.min(ageRange[0], val), val])} min={18} max={60} step={1} className="flex-1" />
              <span className="text-xs text-muted-foreground w-6 shrink-0 text-right">{ageRange[1]}</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground/80 mb-3 block">
              Maximum distance: {maxDistance === 100 ? "100+ ק״מ" : `${maxDistance} ק״מ`}
            </label>
            <div className="px-2">
              <Slider 
                value={[maxDistance]} 
                onValueChange={([val]) => setMaxDistance(val)} 
                min={5} 
                max={100} 
                step={5} 
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-muted-foreground">5 ק״מ</span>
                <span className="text-xs text-muted-foreground">100+ ק״מ</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={() => setStep("profile-photos")} variant="secondary" className="h-14 rounded-2xl px-5">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Button onClick={handleNext} disabled={!lookingFor} className="flex-1 h-14 text-lg gradient-primary border-0 rounded-2xl disabled:opacity-40">
            Next <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
