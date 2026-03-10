import { useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "@/lib/appContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowLeft, MapPin, Navigation, Loader2 } from "lucide-react";
import OnboardingStepper from "./OnboardingStepper";

const popularCities = ["New York", "Los Angeles", "Chicago", "Miami", "San Francisco", "Austin", "Seattle", "Boston"];

export default function LocationStep() {
  const { setStep, updateMyProfile, myProfile } = useApp();
  const [location, setLocation] = useState(myProfile?.location || "");
  const [isLocating, setIsLocating] = useState(false);

  const handleAutoLocation = () => {
    setIsLocating(true);
    setTimeout(() => {
      setLocation("New York");
      updateMyProfile({ location: "New York", coordinates: { lat: 40.7128, lng: -74.0060 } });
      setIsLocating(false);
    }, 1500);
  };

  const handleNext = () => {
    if (!location.trim()) return;
    updateMyProfile({ location: location.trim() });
    setStep("questions");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 pt-8">
      <OnboardingStepper />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary mb-4">
            <MapPin className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold text-gradient mb-2">Where are you?</h1>
          <p className="text-sm text-muted-foreground">We'll find matches in your area</p>
        </div>

        <div className="glass rounded-2xl p-6 space-y-5">
          <Button onClick={handleAutoLocation} disabled={isLocating} variant="secondary" className="w-full h-12 rounded-xl">
            {isLocating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Navigation className="w-4 h-4 mr-2" />}
            {isLocating ? "Locating..." : "Auto-detect location"}
          </Button>

          <div className="flex items-center gap-3">
            <div className="h-px bg-border flex-1" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px bg-border flex-1" />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground/80 mb-2 block">Enter city</label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., New York" className="rounded-xl bg-secondary border-0 h-12" maxLength={50} />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Popular cities</label>
            <div className="flex flex-wrap gap-2">
              {popularCities.map((city) => (
                <motion.button key={city} whileTap={{ scale: 0.95 }} onClick={() => setLocation(city)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${location === city ? "gradient-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
                >
                  {city}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={() => setStep("preferences")} variant="secondary" className="h-14 rounded-2xl px-5">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Button onClick={handleNext} disabled={!location.trim()} className="flex-1 h-14 text-lg gradient-primary border-0 rounded-2xl disabled:opacity-40">
            Next <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
