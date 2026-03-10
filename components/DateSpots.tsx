import { motion } from "framer-motion";
import { mockBars } from "@/lib/mockData";
import { MapPin, Star, Wine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/appContext";

export default function DateSpots() {
  const { setStep } = useApp();

  return (
    <div className="p-4 pb-24">
      <div className="flex items-center gap-2 mb-1">
        <Wine className="w-5 h-5 text-accent" />
        <h1 className="text-2xl font-display font-bold">Date Spots</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-6">Bars and restaurants near you</p>

      <div className="space-y-4">
        {mockBars.map((bar, idx) => (
          <motion.div
            key={bar.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass rounded-2xl overflow-hidden"
          >
            <div className="relative h-36">
              <img src={bar.image} alt={bar.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              <div className="absolute top-3 left-3 bg-accent/90 text-accent-foreground px-2 py-1 rounded-full text-xs font-semibold">
                {bar.vibe}
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-display font-bold text-lg">{bar.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" />
                    {bar.address}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-accent">
                  <Star className="w-4 h-4 fill-accent" />
                  <span className="text-sm font-semibold">{bar.rating}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{bar.distance} away</span>
                <Button size="sm" className="gradient-primary border-0 rounded-lg text-xs">
                  Plan a date here
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
