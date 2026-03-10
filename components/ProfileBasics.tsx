import { useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "@/lib/appContext";
import { conversationVibes, interestTags, ConversationVibe } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight } from "lucide-react";
import OnboardingStepper from "./OnboardingStepper";
import VoiceRecorder from "./VoiceRecorder";

export default function ProfileBasics() {
  const { setStep, setMyProfile, myProfile } = useApp();
  const [name, setName] = useState(myProfile?.name || "");
  const [age, setAge] = useState(myProfile?.age?.toString() || "");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">(myProfile?.gender || "");
  const [bio, setBio] = useState(myProfile?.bio || "");
  const [vibe, setVibe] = useState<ConversationVibe | "">(myProfile?.vibe || "");
  const [interests, setInterests] = useState<string[]>(myProfile?.interests || []);
  const [voiceUrl, setVoiceUrl] = useState<string | null>(myProfile?.voiceClipUrl || null);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(myProfile?.voiceClipBlob || null);

  const isValid = name.trim() && age && gender && Number(age) >= 18;

  const toggleInterest = (tag: string) => {
    setInterests(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : prev.length < 5 ? [...prev, tag] : prev);
  };

  const handleNext = () => {
    if (!isValid || !gender) return;
    setMyProfile({
      name: name.trim(),
      age: Number(age),
      gender: gender as "male" | "female" | "other",
      photos: myProfile?.photos || [],
      bio: bio.trim(),
      lookingFor: myProfile?.lookingFor || "both",
      ageRange: myProfile?.ageRange || [18, 45],
      maxDistance: myProfile?.maxDistance || 25,
      location: myProfile?.location || "",
      vibe: vibe || undefined,
      interests,
      voiceClipUrl: voiceUrl || undefined,
      voiceClipBlob: voiceBlob || undefined,
    });
    setStep("profile-photos");
  };

  const genderOptions = [
    { value: "male", label: "Man 👨" },
    { value: "female", label: "Woman 👩" },
    { value: "other", label: "Other 🌈" },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-6 pt-8 pb-20">
      <OnboardingStepper />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-display font-bold text-gradient tracking-tight mb-1">Lumo</h2>
          <p className="text-xs text-muted-foreground/60 italic mb-3">Fall in love with the person, not the picture</p>
          <h1 className="text-xl font-display font-bold text-foreground">Let's get to know you</h1>
          <p className="text-xs text-muted-foreground">The basics</p>
        </div>

        <div className="glass rounded-2xl p-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="rounded-xl bg-secondary border-0 h-11" maxLength={30} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Age</label>
            <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="18+" min={18} max={99} className="rounded-xl bg-secondary border-0 h-11" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Gender</label>
            <div className="grid grid-cols-3 gap-2">
              {genderOptions.map((opt) => (
                <motion.button key={opt.value} whileTap={{ scale: 0.95 }} onClick={() => setGender(opt.value as typeof gender)}
                  className={`p-2.5 rounded-xl text-center text-sm font-medium transition-all ${gender === opt.value ? "gradient-primary text-primary-foreground shadow-md" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
                >
                  {opt.label}
                </motion.button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Bio (optional)</label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Write something short and fun..." className="rounded-xl bg-secondary border-0 min-h-[70px] resize-none" maxLength={200} />
            <p className="text-xs text-muted-foreground mt-1 text-right">{bio.length}/200</p>
          </div>
        </div>

        {/* Conversation Vibe */}
        <div className="glass rounded-2xl p-5 mt-3">
          <label className="text-sm font-medium text-foreground/80 mb-2 block">Your conversation style 💬</label>
          <p className="text-xs text-muted-foreground mb-3">We'll match you with people who share your vibe</p>
          <div className="grid grid-cols-2 gap-2">
            {conversationVibes.map((v) => (
              <motion.button key={v.value} whileTap={{ scale: 0.95 }} onClick={() => setVibe(v.value)}
                className={`p-3 rounded-xl text-left transition-all ${vibe === v.value ? "gradient-primary text-primary-foreground shadow-md" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
              >
                <div className="text-base mb-0.5">{v.emoji}</div>
                <div className="text-xs font-medium">{v.label}</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div className="glass rounded-2xl p-5 mt-3">
          <label className="text-sm font-medium text-foreground/80 mb-2 block">Interests</label>
          <p className="text-xs text-muted-foreground mb-3">Choose up to 5 ({interests.length}/5)</p>
          <div className="flex flex-wrap gap-1.5">
            {interestTags.map((tag) => (
              <motion.button key={tag} whileTap={{ scale: 0.95 }} onClick={() => toggleInterest(tag)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${interests.includes(tag) ? "gradient-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
              >
                {tag}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Voice Recording */}
        <div className="mt-3">
          <VoiceRecorder
            audioUrl={voiceUrl}
            onRecorded={(blob, url) => { setVoiceBlob(blob); setVoiceUrl(url); }}
            onRemove={() => { setVoiceBlob(null); setVoiceUrl(null); }}
          />
        </div>

        <div className="flex gap-3 mt-5">
          <Button onClick={handleNext} disabled={!isValid} className="flex-1 h-13 text-lg gradient-primary border-0 rounded-2xl disabled:opacity-40">
            Next <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">💡 Click on steps above to navigate</p>
      </motion.div>
    </div>
  );
}
