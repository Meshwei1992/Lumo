import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, Eye, MessageCircle, Shield, Send } from "lucide-react";

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

function LumoLogo() {
  return (
    <motion.div
      animate={{ 
        boxShadow: [
          "0 0 20px 0px hsl(20 100% 65% / 0.3)",
          "0 0 40px 8px hsl(20 100% 65% / 0.5)",
          "0 0 20px 0px hsl(20 100% 65% / 0.3)"
        ]
      }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center"
    >
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="w-10 h-10 rounded-full bg-background/20 backdrop-blur-sm"
      />
    </motion.div>
  );
}

function BlurredProfileCard() {
  return (
    <div className="relative w-64 h-80 mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="relative w-full h-full rounded-3xl overflow-hidden border border-border/40 shadow-2xl"
        style={{ background: "linear-gradient(180deg, hsl(280 20% 12%), hsl(280 25% 8%))" }}
      >
        <div className="absolute inset-0">
          <div
            className="w-full h-full"
            style={{
              background: "radial-gradient(ellipse at 50% 35%, hsl(4 100% 68% / 0.4), hsl(36 100% 60% / 0.2)), linear-gradient(180deg, hsl(30 40% 55% / 0.2) 0%, transparent 60%)",
              filter: "blur(25px)",
            }}
          />
        </div>
        <div className="absolute inset-0 flex items-start justify-center pt-10">
          <div className="w-24 h-24 rounded-full" style={{ background: "hsl(30 30% 60% / 0.2)", filter: "blur(15px)" }} />
        </div>
        <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-background via-background/60 to-transparent">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-4 w-20 rounded-full bg-foreground/25" />
            <div className="h-4 w-10 rounded-full bg-foreground/15" />
          </div>
          <div className="h-2.5 w-32 rounded-full bg-foreground/10 mt-2" />
          <div className="h-2 w-24 rounded-full bg-foreground/8 mt-1.5" />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
          className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-success/20 text-success backdrop-blur-md border border-success/20"
        >
          <Eye className="w-3.5 h-3.5" />
          28%
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 30, y: 10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 1.0, duration: 0.4 }}
        className="absolute -right-4 top-1/3 glass px-3 py-2 rounded-2xl rounded-br-sm text-xs max-w-[110px] text-foreground/80"
      >
        Hey, love your bio! 😊
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: -30, y: 10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 1.3, duration: 0.4 }}
        className="absolute -left-2 top-[55%] gradient-primary px-3 py-2 rounded-2xl rounded-bl-sm text-xs max-w-[100px] text-primary-foreground"
      >
        Thanks! ❤️
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="absolute -bottom-6 inset-x-4"
      >
        <div className="flex items-center gap-2">
          <Send className="w-3 h-3 text-muted-foreground" />
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "28%" }}
              transition={{ delay: 1.7, duration: 1.5, ease: "easeOut" }}
              className="h-full rounded-full gradient-primary"
            />
          </div>
          <Eye className="w-3 h-3 text-muted-foreground" />
        </div>
      </motion.div>
    </div>
  );
}

export default function WelcomeScreen({ onGetStarted, onLogin }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-between py-12 px-6 relative overflow-hidden max-w-lg mx-auto">
      <div className="absolute inset-0 bg-background" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-20" style={{ background: "radial-gradient(circle, hsl(4 100% 68%), transparent 70%)" }} />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-15" style={{ background: "radial-gradient(circle, hsl(36 100% 60%), transparent 70%)" }} />
      <div className="absolute top-1/2 left-0 w-[300px] h-[300px] rounded-full opacity-10" style={{ background: "radial-gradient(circle, hsl(4 100% 70%), transparent 70%)" }} />

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center relative z-10">
        <div className="mb-6 flex justify-center">
          <LumoLogo />
        </div>
        <h1 className="text-5xl font-display font-bold text-gradient mb-4 tracking-tight">Lumo</h1>
        <p className="text-lg text-foreground/90 font-medium mb-2 max-w-[300px] mx-auto leading-relaxed">
          Fall in love with the person, not the picture.
        </p>
        <p className="text-sm text-muted-foreground max-w-[280px] mx-auto">
          Photos reveal as your connection grows.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="relative z-10 my-8">
        <BlurredProfileCard />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="w-full relative z-10 space-y-6">
        <div className="space-y-3">
          {[
            { icon: MessageCircle, text: "Connect through conversation first" },
            { icon: Eye, text: "Photos reveal over time" },
            { icon: Shield, text: "Smart matching based on chemistry" },
          ].map((feature, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.0 + idx * 0.12 }} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/80 flex items-center justify-center shrink-0 border border-border/30">
                <feature.icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm text-foreground/75">{feature.text}</span>
            </motion.div>
          ))}
        </div>

        <div className="space-y-3 pt-2">
          <Button onClick={onGetStarted} className="w-full h-14 text-base gradient-primary border-0 rounded-2xl shadow-lg shadow-primary/25 font-semibold">
            <Sparkles className="w-5 h-5 mr-2" />
            Start discovering
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <button onClick={onLogin} className="text-primary font-medium hover:underline">Sign in</button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
