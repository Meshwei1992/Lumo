import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dices, Sparkles, CheckCircle2, XCircle, Trophy, ArrowLeft, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ── Types ──
type GameType = "menu" | "truth-guess" | "rps" | "quick-match";
type RPSChoice = "rock" | "paper" | "scissors";

interface ChatGamesProps {
  matchName: string;
  onReward: (scoreBonus: number, revealBonus: number) => void;
  onClose: () => void;
}

// ── Data ──
const FAKE_STATEMENTS: Record<string, string[]> = {
  default: [
    "I once climbed Mount Everest.",
    "I've been skydiving 12 times.",
    "I speak 5 languages fluently.",
    "I won a national chess tournament.",
    "I lived on a boat for a year.",
    "I've met a president.",
    "I once ran a marathon backwards.",
    "I've been to every continent.",
  ],
};

const QUICK_MATCH_QUESTIONS = [
  { q: "Mountains or beach?", a: "🏔️ Mountains", b: "🏖️ Beach" },
  { q: "Morning person or night owl?", a: "🌅 Morning", b: "🌙 Night" },
  { q: "Cook at home or eat out?", a: "👨‍🍳 Cook", b: "🍽️ Eat out" },
  { q: "Dogs or cats?", a: "🐕 Dogs", b: "🐱 Cats" },
  { q: "City or countryside?", a: "🏙️ City", b: "🌿 Countryside" },
  { q: "Netflix or adventure?", a: "📺 Netflix", b: "🧗 Adventure" },
  { q: "Sweet or salty?", a: "🍫 Sweet", b: "🧂 Salty" },
  { q: "Plan everything or go with the flow?", a: "📋 Plan", b: "🌊 Flow" },
];

const RPS_EMOJIS: Record<RPSChoice, string> = { rock: "🪨", paper: "📄", scissors: "✂️" };

// ── Component ──
export default function ChatGames({ matchName, onReward, onClose }: ChatGamesProps) {
  const [game, setGame] = useState<GameType>("menu");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="flex-1 overflow-y-auto p-4"
    >
      {game !== "menu" && (
        <button
          onClick={() => setGame("menu")}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" /> Back to games
        </button>
      )}

      {game === "menu" && <GameMenu onSelect={setGame} onClose={onClose} />}
      {game === "truth-guess" && <TruthGuess matchName={matchName} onReward={onReward} onBack={() => setGame("menu")} />}
      {game === "rps" && <RockPaperScissors matchName={matchName} onReward={onReward} />}
      {game === "quick-match" && <QuickMatch matchName={matchName} onReward={onReward} />}
    </motion.div>
  );
}

// ── Game Menu ──
function GameMenu({ onSelect, onClose }: { onSelect: (g: GameType) => void; onClose: () => void }) {
  const games = [
    { id: "truth-guess" as GameType, emoji: "🤔", title: "Truth Guess", desc: "Guess what's real about your match", color: "from-violet-500/20 to-purple-500/20" },
    { id: "rps" as GameType, emoji: "✊", title: "Rock Paper Scissors", desc: "Quick battle for bonus points", color: "from-orange-500/20 to-red-500/20" },
    { id: "quick-match" as GameType, emoji: "⚡", title: "Quick Match", desc: "See if you think alike", color: "from-blue-500/20 to-cyan-500/20" },
  ];

  return (
    <div>
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3"
        >
          <Dices className="w-7 h-7 text-primary" />
        </motion.div>
        <h2 className="text-lg font-display font-bold">Play Mode</h2>
        <p className="text-xs text-muted-foreground mt-1">Fun games to break the ice with {"{matchName}"}</p>
      </div>

      <div className="space-y-2.5">
        {games.map((g, i) => (
          <motion.button
            key={g.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(g.id)}
            className={`w-full p-4 rounded-2xl bg-gradient-to-r ${g.color} border border-border/20 flex items-center gap-3.5 text-left hover:border-primary/20 transition-colors`}
          >
            <span className="text-2xl">{g.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{g.title}</p>
              <p className="text-[11px] text-muted-foreground">{g.desc}</p>
            </div>
            <Zap className="w-4 h-4 text-primary/40 shrink-0" />
          </motion.button>
        ))}
      </div>

      <button
        onClick={onClose}
        className="w-full mt-4 p-3 text-xs text-muted-foreground hover:text-foreground text-center transition-colors"
      >
        Back to chat
      </button>
    </div>
  );
}

// ── Truth Guess ──
function TruthGuess({
  matchName,
  onReward,
  onBack,
}: {
  matchName: string;
  onReward: (s: number, r: number) => void;
  onBack: () => void;
}) {
  const [phase, setPhase] = useState<"write" | "guess" | "result">("write");
  const [truthStatement, setTruthStatement] = useState("");
  const [fakeStatement, setFakeStatement] = useState("");
  const [options, setOptions] = useState<[string, string]>(["", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [guessedCorrectly, setGuessedCorrectly] = useState<boolean | null>(null);

  const handleSubmitTruth = () => {
    if (!truthStatement.trim()) return;
    const fakes = FAKE_STATEMENTS.default;
    const fake = fakes[Math.floor(Math.random() * fakes.length)];
    setFakeStatement(fake);

    // Randomize order
    if (Math.random() > 0.5) {
      setOptions([truthStatement, fake]);
      setCorrectIndex(0);
    } else {
      setOptions([fake, truthStatement]);
      setCorrectIndex(1);
    }
    setPhase("guess");
  };

  const handleGuess = (index: number) => {
    const correct = index === correctIndex;
    setGuessedCorrectly(correct);
    setPhase("result");
    if (correct) {
      onReward(5, 5);
    }
  };

  const reset = () => {
    setPhase("write");
    setTruthStatement("");
    setGuessedCorrectly(null);
  };

  return (
    <div>
      <div className="text-center mb-5">
        <span className="text-3xl">🤔</span>
        <h3 className="text-base font-display font-bold mt-2">Truth Guess</h3>
      </div>

      <AnimatePresence mode="wait">
        {phase === "write" && (
          <motion.div key="write" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p className="text-xs text-muted-foreground text-center mb-4">
              Write one TRUE statement about yourself
            </p>
            <Input
              value={truthStatement}
              onChange={(e) => setTruthStatement(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmitTruth()}
              placeholder='e.g. "I once swam with dolphins"'
              className="rounded-xl bg-secondary border-0 h-11 text-sm mb-3"
              autoFocus
            />
            <Button
              onClick={handleSubmitTruth}
              disabled={!truthStatement.trim()}
              className="w-full gradient-primary border-0 rounded-xl disabled:opacity-30"
            >
              Submit truth
            </Button>
          </motion.div>
        )}

        {phase === "guess" && (
          <motion.div key="guess" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <p className="text-xs text-muted-foreground text-center mb-1">
              {matchName} says one of these is true:
            </p>
            <p className="text-[10px] text-muted-foreground/60 text-center mb-4">Which one is real?</p>
            <div className="space-y-2.5">
              {options.map((opt, i) => (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleGuess(i)}
                  className="w-full p-4 rounded-xl bg-secondary/60 hover:bg-secondary text-left text-sm transition-colors border border-border/20"
                >
                  <span className="text-primary/60 mr-1.5">{i === 0 ? "A" : "B"}.</span>
                  "{opt}"
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {phase === "result" && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="text-center p-6 rounded-2xl bg-card border border-border/30">
              {guessedCorrectly ? (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 12 }}
                  >
                    <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
                  </motion.div>
                  <p className="text-lg font-display font-bold text-success mb-1">Correct! 🎉</p>
                  <p className="text-xs text-muted-foreground mb-3">You know {matchName} well!</p>
                  <div className="flex items-center justify-center gap-3 text-xs">
                    <span className="px-2.5 py-1 rounded-full bg-success/10 text-success font-medium">Connection +5</span>
                    <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">Reveal +5%</span>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-lg font-display font-bold mb-1">Not quite! 😄</p>
                  <p className="text-xs text-muted-foreground">Keep chatting to learn more about each other</p>
                </>
              )}
              <Button onClick={reset} variant="secondary" className="mt-4 rounded-xl text-xs">
                Play again
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Rock Paper Scissors ──
function RockPaperScissors({
  matchName,
  onReward,
}: {
  matchName: string;
  onReward: (s: number, r: number) => void;
}) {
  const [myChoice, setMyChoice] = useState<RPSChoice | null>(null);
  const [opponentChoice, setOpponentChoice] = useState<RPSChoice | null>(null);
  const [result, setResult] = useState<"win" | "lose" | "draw" | null>(null);
  const [revealing, setRevealing] = useState(false);

  const choices: RPSChoice[] = ["rock", "paper", "scissors"];

  const getResult = (me: RPSChoice, them: RPSChoice): "win" | "lose" | "draw" => {
    if (me === them) return "draw";
    if (
      (me === "rock" && them === "scissors") ||
      (me === "paper" && them === "rock") ||
      (me === "scissors" && them === "paper")
    ) return "win";
    return "lose";
  };

  const handleChoice = (choice: RPSChoice) => {
    setMyChoice(choice);
    setRevealing(true);

    setTimeout(() => {
      const opp = choices[Math.floor(Math.random() * 3)];
      setOpponentChoice(opp);
      const res = getResult(choice, opp);
      setResult(res);
      setRevealing(false);
      if (res === "win") onReward(5, 5);
      if (res === "draw") onReward(2, 0);
    }, 1200);
  };

  const reset = () => {
    setMyChoice(null);
    setOpponentChoice(null);
    setResult(null);
  };

  return (
    <div>
      <div className="text-center mb-5">
        <span className="text-3xl">✊</span>
        <h3 className="text-base font-display font-bold mt-2">Rock Paper Scissors</h3>
        <p className="text-xs text-muted-foreground mt-1">vs {matchName}</p>
      </div>

      {!myChoice && (
        <div className="flex justify-center gap-4">
          {choices.map((c) => (
            <motion.button
              key={c}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleChoice(c)}
              className="w-20 h-20 rounded-2xl bg-secondary/60 hover:bg-secondary flex flex-col items-center justify-center gap-1 border border-border/20 transition-colors"
            >
              <span className="text-3xl">{RPS_EMOJIS[c]}</span>
              <span className="text-[10px] text-muted-foreground capitalize">{c}</span>
            </motion.button>
          ))}
        </div>
      )}

      {myChoice && revealing && (
        <div className="text-center py-8">
          <motion.div
            animate={{ rotate: [0, 10, -10, 10, -10, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-5xl"
          >
            ✊
          </motion.div>
          <p className="text-xs text-muted-foreground mt-3">Waiting for {matchName}...</p>
        </div>
      )}

      {result && opponentChoice && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="flex items-center justify-center gap-6 mb-4">
            <div className="text-center">
              <span className="text-4xl">{RPS_EMOJIS[myChoice!]}</span>
              <p className="text-[10px] text-muted-foreground mt-1">You</p>
            </div>
            <span className="text-lg font-bold text-muted-foreground">vs</span>
            <div className="text-center">
              <span className="text-4xl">{RPS_EMOJIS[opponentChoice]}</span>
              <p className="text-[10px] text-muted-foreground mt-1">{matchName}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border/30">
            {result === "win" && (
              <>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                  <Trophy className="w-10 h-10 text-success mx-auto mb-2" />
                </motion.div>
                <p className="font-display font-bold text-success">You win! 🎉</p>
                <div className="flex items-center justify-center gap-2 mt-2 text-xs">
                  <span className="px-2 py-0.5 rounded-full bg-success/10 text-success">+5 Connection</span>
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary">+5% Reveal</span>
                </div>
              </>
            )}
            {result === "lose" && (
              <>
                <p className="text-lg font-display font-bold mb-1">{matchName} wins! 😄</p>
                <p className="text-xs text-muted-foreground">Better luck next time</p>
              </>
            )}
            {result === "draw" && (
              <>
                <p className="text-lg font-display font-bold mb-1">It's a draw! 🤝</p>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">+2 Connection</span>
              </>
            )}
            <Button onClick={reset} variant="secondary" className="mt-3 rounded-xl text-xs">
              Play again
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ── Quick Match ──
function QuickMatch({
  matchName,
  onReward,
}: {
  matchName: string;
  onReward: (s: number, r: number) => void;
}) {
  const [qIndex, setQIndex] = useState(0);
  const [myAnswer, setMyAnswer] = useState<"a" | "b" | null>(null);
  const [matchAnswer, setMatchAnswer] = useState<"a" | "b" | null>(null);
  const [isMatch, setIsMatch] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);

  const current = QUICK_MATCH_QUESTIONS[qIndex % QUICK_MATCH_QUESTIONS.length];

  const handleAnswer = (choice: "a" | "b") => {
    setMyAnswer(choice);

    // Simulate match's answer
    setTimeout(() => {
      const opp: "a" | "b" = Math.random() > 0.45 ? choice : choice === "a" ? "b" : "a";
      setMatchAnswer(opp);
      const matched = choice === opp;
      setIsMatch(matched);
      if (matched) {
        setScore((s) => s + 1);
        onReward(5, 0);
      }
    }, 800);
  };

  const nextQuestion = () => {
    setQIndex((i) => i + 1);
    setMyAnswer(null);
    setMatchAnswer(null);
    setIsMatch(null);
  };

  return (
    <div>
      <div className="text-center mb-5">
        <span className="text-3xl">⚡</span>
        <h3 className="text-base font-display font-bold mt-2">Quick Match</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Matches: {score} • Round {(qIndex % QUICK_MATCH_QUESTIONS.length) + 1}/{QUICK_MATCH_QUESTIONS.length}
        </p>
      </div>

      <motion.div
        key={qIndex}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        className="p-5 rounded-2xl bg-card border border-border/30 text-center mb-4"
      >
        <p className="text-sm font-semibold mb-5">{current.q}</p>

        {!myAnswer ? (
          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAnswer("a")}
              className="flex-1 p-4 rounded-xl bg-secondary/60 hover:bg-secondary text-sm font-medium transition-colors border border-border/20"
            >
              {current.a}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAnswer("b")}
              className="flex-1 p-4 rounded-xl bg-secondary/60 hover:bg-secondary text-sm font-medium transition-colors border border-border/20"
            >
              {current.b}
            </motion.button>
          </div>
        ) : !matchAnswer ? (
          <div className="py-4">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-xs text-muted-foreground"
            >
              Waiting for {matchName}'s answer...
            </motion.div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="flex justify-center gap-4 mb-4">
              <div className="text-center">
                <div className={`px-4 py-2 rounded-xl text-sm font-medium ${myAnswer === "a" ? "bg-primary/10 text-primary border border-primary/20" : "bg-secondary/60"}`}>
                  {myAnswer === "a" ? current.a : current.b}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">You</p>
              </div>
              <div className="text-center">
                <div className={`px-4 py-2 rounded-xl text-sm font-medium ${matchAnswer === "a" ? "bg-primary/10 text-primary border border-primary/20" : "bg-secondary/60"}`}>
                  {matchAnswer === "a" ? current.a : current.b}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">{matchName}</p>
              </div>
            </div>

            {isMatch ? (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                <p className="text-sm font-bold text-success mb-1">✨ It's a match!</p>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-success/10 text-success">Connection +5</span>
              </motion.div>
            ) : (
              <p className="text-sm text-muted-foreground">Different tastes — that's interesting! 😊</p>
            )}

            <Button onClick={nextQuestion} variant="secondary" className="mt-3 rounded-xl text-xs">
              Next question
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
