import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface ConnectionMeterProps {
  score: number; // 0-100
  revealPercent: number; // 0-100
}

export default function ConnectionMeter({ score, revealPercent }: ConnectionMeterProps) {
  const segments = 5;
  const filledSegments = Math.round((score / 100) * segments);

  return (
    <div className="px-4 py-2">
      <div className="glass rounded-xl px-3 py-2.5 flex items-center gap-3">
        <div className="flex items-center gap-1.5 shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-[11px] font-medium text-foreground/70">רמת חיבור</span>
        </div>
        <div className="flex gap-1 flex-1">
          {Array.from({ length: segments }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scaleY: 0.5, opacity: 0.3 }}
              animate={{
                scaleY: i < filledSegments ? 1 : 0.5,
                opacity: i < filledSegments ? 1 : 0.3,
              }}
              transition={{ delay: i * 0.1, type: "spring" }}
              className={`h-2.5 flex-1 rounded-full ${
                i < filledSegments
                  ? score >= 80
                    ? "bg-success"
                    : score >= 40
                    ? "bg-primary"
                    : "bg-accent"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>
        <span className="text-[11px] font-semibold text-primary shrink-0">
          {revealPercent}% נחשף
        </span>
      </div>
    </div>
  );
}
