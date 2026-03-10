import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/lib/appContext";
import { useAuth } from "@/lib/authContext";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Camera, Plus, X, ArrowRight, ArrowLeft, ImagePlus, Upload, Instagram, Facebook, Loader2, Sparkles } from "lucide-react";
import OnboardingStepper from "./OnboardingStepper";
import { toast } from "@/components/ui/sonner";
import { CATEGORY_CONFIG, type PhotoCategory } from "@/lib/photoCategories";

const samplePhotos = [
  "https://images.unsplash.com/photo-1535930749574-1399327ce78f?w=300&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=300&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=400&fit=crop&crop=face",
];

export default function ProfilePhotos() {
  const { setStep, updateMyProfile, myProfile } = useApp();
  const { user } = useAuth();
  const [photos, setPhotos] = useState<string[]>(myProfile?.photos || []);
  const [uploading, setUploading] = useState(false);
  const [classifying, setClassifying] = useState(false);
  const [photoCategories, setPhotoCategories] = useState<Record<string, PhotoCategory>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const classifyPhoto = async (photoUrl: string, photoId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("classify-photo", {
        body: { photoUrl, photoId },
      });
      if (error) throw error;
      if (data?.category) {
        setPhotoCategories((prev) => ({ ...prev, [photoUrl]: data.category }));
        const config = CATEGORY_CONFIG[data.category as keyof typeof CATEGORY_CONFIG];
        if (config) {
          toast.success(`${config.emoji} Classified as ${config.label}`, { duration: 2500 });
        }
      }
      return data?.category || "unclassified";
    } catch (err) {
      console.error("Classification error:", err);
      return "unclassified";
    }
  };

  const addPhoto = (url: string) => {
    if (photos.length >= 6) return;
    setPhotos((prev) => [...prev, url]);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;

    const remaining = 6 - photos.length;
    const filesToUpload = Array.from(files).slice(0, remaining);

    if (filesToUpload.length === 0) {
      toast.error("Maximum 6 photos allowed");
      return;
    }

    setUploading(true);
    const newPhotos: { url: string; path: string }[] = [];

    for (const file of filesToUpload) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        continue;
      }

      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error } = await supabase.storage
        .from("profile-photos")
        .upload(path, file, { upsert: true });

      if (error) {
        toast.error(`Failed to upload ${file.name}`);
        console.error(error);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from("profile-photos")
        .getPublicUrl(path);

      newPhotos.push({ url: urlData.publicUrl, path });
    }

    if (newPhotos.length > 0) {
      const urls = newPhotos.map((p) => p.url);
      setPhotos((prev) => [...prev, ...urls]);
      toast.success(`${newPhotos.length} photo${newPhotos.length > 1 ? "s" : ""} uploaded! 📸`);

      // Save to DB and classify
      setClassifying(true);
      for (const photo of newPhotos) {
        // Insert into profile_photos table
        const { data: insertData, error: insertErr } = await supabase
          .from("profile_photos")
          .insert({ user_id: user.id, photo_url: photo.url, sort_order: photos.length })
          .select("id")
          .single();

        if (!insertErr && insertData?.id) {
          classifyPhoto(photo.url, insertData.id);
        }
      }
      setClassifying(false);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSocialConnect = (provider: "instagram" | "facebook") => {
    toast.info(`${provider === "instagram" ? "Instagram" : "Facebook"} integration coming soon! 🔜`, {
      description: "We're working on connecting social accounts to import photos.",
    });
  };

  const handleNext = () => {
    if (photos.length === 0) return;
    updateMyProfile({ photos });
    setStep("preferences");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 pt-8">
      <OnboardingStepper />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary mb-4">
            <Camera className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold text-gradient mb-2">Add Photos</h1>
          <p className="text-sm text-muted-foreground">Your photos start blurred and reveal gradually 🔮</p>
        </div>

        {/* Photo Grid */}
        <div className="glass rounded-2xl p-4 mb-4">
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[0, 1, 2, 3, 4, 5].map((slot) => {
              const photo = photos[slot];
              return (
                <motion.div
                  key={slot}
                  layout
                  className={`aspect-[3/4] rounded-xl overflow-hidden relative ${
                    photo ? "" : "border-2 border-dashed border-border/60 flex items-center justify-center bg-secondary/40 cursor-pointer hover:bg-secondary/60 transition-colors"
                  }`}
                  onClick={() => !photo && photos.length < 6 && fileInputRef.current?.click()}
                >
                  {photo ? (
                    <>
                      <img src={photo} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={(e) => { e.stopPropagation(); removePhoto(slot); }}
                        className="absolute top-1 left-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      {/* Category badge */}
                      {photoCategories[photo] && photoCategories[photo] !== "unclassified" && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute bottom-1 left-1 bg-card/90 backdrop-blur-sm text-[9px] px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5 text-foreground"
                        >
                          <Sparkles className="w-2.5 h-2.5 text-primary" />
                          {CATEGORY_CONFIG[photoCategories[photo] as keyof typeof CATEGORY_CONFIG]?.label}
                        </motion.div>
                      )}
                      {slot === 0 && !photoCategories[photo] && (
                        <div className="absolute bottom-1 right-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
                          Main
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <Plus className="w-5 h-5 text-muted-foreground" />
                      {slot === photos.length && (
                        <span className="text-[9px] text-muted-foreground">Add</span>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground text-center">
            {photos.length}/6 photos • At least 1 required
            {classifying && (
              <span className="ml-2 text-primary inline-flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> AI classifying...
              </span>
            )}
          </p>
        </div>

        {/* Upload from device */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileUpload}
        />
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || photos.length >= 6}
          className="w-full glass rounded-2xl p-4 mb-3 flex items-center gap-3 text-left hover:bg-secondary/40 transition-colors disabled:opacity-40"
        >
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shrink-0">
            {uploading ? (
              <Loader2 className="w-5 h-5 text-primary-foreground animate-spin" />
            ) : (
              <Upload className="w-5 h-5 text-primary-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">
              {uploading ? "Uploading..." : "Upload from device"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Choose photos from your gallery or files
            </p>
          </div>
        </motion.button>

        {/* Social Imports */}
        <div className="flex gap-2 mb-4">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => handleSocialConnect("instagram")}
            className="flex-1 glass rounded-2xl p-3 flex items-center gap-2.5 hover:bg-secondary/40 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)" }}>
              <Instagram className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-xs font-medium text-foreground">Instagram</p>
              <p className="text-[10px] text-muted-foreground">Import photos</p>
            </div>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => handleSocialConnect("facebook")}
            className="flex-1 glass rounded-2xl p-3 flex items-center gap-2.5 hover:bg-secondary/40 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-[#1877F2]">
              <Facebook className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-xs font-medium text-foreground">Facebook</p>
              <p className="text-[10px] text-muted-foreground">Import photos</p>
            </div>
          </motion.button>
        </div>

        {/* Sample photos */}
        <div className="glass rounded-2xl p-4 mb-6">
          <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
            <ImagePlus className="w-3.5 h-3.5" />
            Or choose from samples (demo)
          </p>
          <div className="grid grid-cols-6 gap-1.5">
            {samplePhotos.map((url, idx) => {
              const isSelected = photos.includes(url);
              return (
                <motion.button
                  key={idx}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => !isSelected && addPhoto(url)}
                  className={`aspect-square rounded-lg overflow-hidden relative ${isSelected ? "opacity-40 ring-2 ring-primary" : ""}`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={() => setStep("profile-basics")} variant="secondary" className="h-14 rounded-2xl px-5">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Button onClick={handleNext} disabled={photos.length === 0} className="flex-1 h-14 text-lg gradient-primary border-0 rounded-2xl disabled:opacity-40">
            Next <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
