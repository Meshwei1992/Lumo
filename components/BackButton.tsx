import { useApp } from "@/lib/appContext";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BackButton() {
  const { goBack, canGoBack } = useApp();

  if (!canGoBack) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={goBack}
      className="absolute top-4 right-4 z-50"
      aria-label="חזרה"
    >
      <ArrowRight className="w-5 h-5" />
    </Button>
  );
}
