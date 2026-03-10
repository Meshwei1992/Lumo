import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { onboardingQuestions } from "@/lib/mockData";
import { useApp } from "@/lib/appContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Heart, ArrowLeft, Sparkles, SkipForward } from "lucide-react";
import OnboardingStepper from "./OnboardingStepper";

const REQUIRED_ANSWERS = 10;

export default function OnboardingQuestions() {
  const { setUserAnswers, setStep } = useApp();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<string | null>(null);

  // Get available questions (not skipped)
  const availableQuestions = useMemo(() => {
    return onboardingQuestions.filter(q => !skippedIds.has(q.id));
  }, [skippedIds]);

  // Current question index within answered questions
  const answeredCount = Object.keys(answers).length;
  
  // Find the current question to show
  const currentQuestion = useMemo(() => {
    const answeredIds = Object.keys(answers);
    // Find first available question that hasn't been answered yet
    return availableQuestions.find(q => !answeredIds.includes(q.id));
  }, [availableQuestions, answers]);

  const progress = (answeredCount / REQUIRED_ANSWERS) * 100;
  const isComplete = answeredCount >= REQUIRED_ANSWERS;

  const handleSelect = (optionIndex: string) => {
    if (!currentQuestion) return;
    setSelected(optionIndex);
    
    // Auto-advance after a brief visual feedback delay
    setTimeout(() => {
      const newAnswers = { ...answers, [currentQuestion.id]: optionIndex };
      setAnswers(newAnswers);
      setSelected(null);

      if (Object.keys(newAnswers).length >= REQUIRED_ANSWERS) {
        setUserAnswers(newAnswers);
      }
    }, 350);
  };

  const handleBack = () => {
    const answeredIds = Object.keys(answers);
    if (answeredIds.length > 0) {
      const lastAnsweredId = answeredIds[answeredIds.length - 1];
      const lastAnswer = answers[lastAnsweredId];
      const newAnswers = { ...answers };
      delete newAnswers[lastAnsweredId];
      setAnswers(newAnswers);
      setSelected(lastAnswer);
    } else {
      setStep("location");
    }
  };

  // Check if skip is allowed
  const canSkip = useMemo(() => {
    if (!currentQuestion) return false;
    const remainingQuestions = availableQuestions.filter(q => !Object.keys(answers).includes(q.id));
    const questionsNeeded = REQUIRED_ANSWERS - answeredCount;
    return remainingQuestions.length > questionsNeeded;
  }, [availableQuestions, answers, answeredCount, currentQuestion]);

  if (!currentQuestion && !isComplete) {
    // No more questions available but not complete - shouldn't happen
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 pt-8">
      <OnboardingStepper />
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-display font-bold text-gradient">Let's get to know you</h1>
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <p className="text-muted-foreground">Answer {REQUIRED_ANSWERS} questions to find your perfect match</p>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => {
            setUserAnswers({});
            setStep("discover");
          }}
          className="mt-3 text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors underline underline-offset-2"
        >
          Skip all questions
        </motion.button>
      </motion.div>

      <div className="w-full max-w-md mb-6">
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2 text-center">
          {answeredCount} / {REQUIRED_ANSWERS} answered
          {skippedIds.size > 0 && <span className="text-primary ml-2">({skippedIds.size} skipped)</span>}
        </p>
      </div>

      {currentQuestion && (
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentQuestion.id} 
            initial={{ opacity: 0, x: 50 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -50 }} 
            className="w-full max-w-md"
          >
            <div className="glass rounded-2xl p-6 mb-4">
              {/* Small back button above question */}
              {answeredCount > 0 && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={handleBack}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Previous question
                </motion.button>
              )}
              <h2 className="text-xl font-display font-semibold mb-6 text-center">{currentQuestion.question}</h2>
              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => (
                  <motion.button 
                    key={idx} 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }} 
                    onClick={() => handleSelect(String(idx))}
                    className={`w-full p-4 rounded-xl text-left transition-all duration-300 ${
                      selected === String(idx) 
                        ? "gradient-primary text-primary-foreground shadow-lg" 
                        : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                    }`}
                  >
                    {option}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Skip button */}
            {canSkip && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => {
                  if (!currentQuestion) return;
                  setSkippedIds(prev => new Set([...prev, currentQuestion.id]));
                  setSelected(null);
                }}
                className="w-full p-3 rounded-xl text-center text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors flex items-center justify-center gap-2"
              >
                <SkipForward className="w-4 h-4" />
                Skip this question
              </motion.button>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
