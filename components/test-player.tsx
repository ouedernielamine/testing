"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Star,
  Trophy,
  RotateCcw,
  ArrowRight,
  Target,
  Sparkles,
} from "lucide-react";

type Option = {
  id: string;
  texte: string;
  correct: boolean;
  justification?: string;
};

type Question = {
  id: string;
  ordre: number;
  enonce: string;
  contexte?: string | null;
  options: Option[];
};

type TestPlayerProps = {
  type: "QCM" | "CAS_CLINIQUE" | "VRAI_FAUX";
  questions: Question[];
  onComplete?: (correct: number, total: number) => void;
};

export function TestPlayer({ type, questions, onComplete }: TestPlayerProps) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Set<string>>>({});
  // Track which questions have been validated
  const [validated, setValidated] = useState<Set<number>>(new Set());
  const [showResults, setShowResults] = useState(false);

  const current = questions[index];
  const isCurrentValidated = validated.has(index);
  const selectedIds = answers[current?.id] ?? new Set<string>();

  const toggleOption = (questionId: string, optionId: string) => {
    if (isCurrentValidated) return;
    setAnswers((prev) => {
      const selected = new Set(prev[questionId] ?? []);
      if (selected.has(optionId)) {
        selected.delete(optionId);
      } else {
        selected.add(optionId);
      }
      return { ...prev, [questionId]: selected };
    });
  };

  const validateCurrent = () => {
    setValidated((prev) => new Set(prev).add(index));
  };

  const isQuestionCorrect = (q: Question) => {
    const selected = answers[q.id] ?? new Set<string>();
    const correctIds = new Set(q.options.filter((o) => o.correct).map((o) => o.id));
    if (selected.size !== correctIds.size) return false;
    for (const id of selected) {
      if (!correctIds.has(id)) return false;
    }
    return true;
  };

  const results = useMemo(() => {
    const correct = questions.filter((q) => isQuestionCorrect(q)).length;
    return { correct, total: questions.length, percentage: questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0 };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, questions]);

  const stars = results.percentage <= 40 ? 1 : results.percentage <= 70 ? 2 : 3;

  const goNext = () => {
    if (index < questions.length - 1) {
      setIndex(index + 1);
    }
  };

  const goPrev = () => {
    if (index > 0) {
      setIndex(index - 1);
    }
  };

  const finishTest = () => {
    setShowResults(true);
    onComplete?.(results.correct, results.total);
  };

  const reset = () => {
    setAnswers({});
    setValidated(new Set());
    setIndex(0);
    setShowResults(false);
  };

  if (questions.length === 0) {
    return <p className="text-sm text-text-muted">Aucune question disponible.</p>;
  }

  /* ═══ RESULTS SCREEN ═══ */
  if (showResults) {
    const grade = results.percentage >= 80 ? "excellent" : results.percentage >= 60 ? "bien" : results.percentage >= 40 ? "moyen" : "insuffisant";
    const gradeConfig = {
      excellent: { label: "Excellent !", color: "text-green-600", bg: "from-green-50 to-emerald-50", border: "border-green-200", icon: Sparkles },
      bien: { label: "Bien joué !", color: "text-primary", bg: "from-blue-50 to-primary/5", border: "border-primary/20", icon: Trophy },
      moyen: { label: "Peut mieux faire", color: "text-amber-600", bg: "from-amber-50 to-yellow-50", border: "border-amber-200", icon: Target },
      insuffisant: { label: "À retravailler", color: "text-accent-rose", bg: "from-red-50 to-rose-50", border: "border-red-200", icon: Target },
    }[grade];
    const GradeIcon = gradeConfig.icon;

    return (
      <div className="space-y-6">
        {/* Score hero */}
        <div className={cn("rounded-2xl border bg-gradient-to-br p-8 text-center", gradeConfig.border, gradeConfig.bg)}>
          <div className="flex justify-center mb-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/80 shadow-sm">
              <GradeIcon className={cn("h-10 w-10", gradeConfig.color)} />
            </div>
          </div>
          <h3 className={cn("font-serif text-2xl font-bold", gradeConfig.color)}>
            {gradeConfig.label}
          </h3>
          <p className="mt-2 text-4xl font-bold text-foreground">
            {results.percentage}%
          </p>
          <p className="mt-1 text-sm text-text-muted">
            {results.correct} / {results.total} question{results.total !== 1 ? "s" : ""} correcte{results.correct !== 1 ? "s" : ""}
          </p>

          {/* Stars */}
          <div className="mt-4 flex items-center justify-center gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-8 w-8 transition-all",
                  i < stars
                    ? "fill-accent-gold text-accent-gold drop-shadow-sm"
                    : "text-primary/15"
                )}
              />
            ))}
          </div>

          {/* Badge */}
          {results.percentage === 100 && (
            <Badge className="mt-4 bg-accent-gold/15 text-accent-gold font-bold text-sm gap-1.5 px-4 py-1.5">
              <Trophy className="h-4 w-4" />
              Score parfait !
            </Badge>
          )}
        </div>

        {/* Per-question breakdown */}
        <div className="rounded-2xl border border-primary/8 bg-surface p-5">
          <h4 className="flex items-center gap-2 font-serif text-sm font-bold text-foreground mb-4">
            <Target className="h-4 w-4 text-accent-gold" />
            Détail par question
          </h4>
          <div className="space-y-2">
            {questions.map((q, qi) => {
              const correct = isQuestionCorrect(q);
              return (
                <button
                  key={q.id}
                  onClick={() => { setShowResults(false); setIndex(qi); }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all hover:shadow-sm",
                    correct
                      ? "border-green-200 bg-green-50/50 hover:bg-green-50"
                      : "border-red-200 bg-red-50/50 hover:bg-red-50"
                  )}
                >
                  <div className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                    correct ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  )}>
                    {correct ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      Q{qi + 1}. {q.enonce}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-text-muted" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button onClick={reset} variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Refaire le test
          </Button>
          {onComplete && (
            <Button onClick={() => onComplete(results.correct, results.total)} className="gap-2">
              <ArrowRight className="h-4 w-4" />
              Retour aux tests
            </Button>
          )}
        </div>
      </div>
    );
  }

  /* ═══ QUESTION VIEW ═══ */
  const correctIds = new Set(current.options.filter((o) => o.correct).map((o) => o.id));
  const correctCount = correctIds.size;

  return (
    <div className="space-y-5">
      {/* Progress bar + question dots */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-text-muted">
            Question {index + 1} / {questions.length}
          </p>
          {validated.size > 0 && (
            <p className="text-xs text-text-muted">
              {[...validated].filter((vi) => isQuestionCorrect(questions[vi])).length} correcte{[...validated].filter((vi) => isQuestionCorrect(questions[vi])).length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-primary/10">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${((index + 1) / questions.length) * 100}%` }}
          />
        </div>
        {/* Question dots */}
        <div className="flex flex-wrap gap-1.5">
          {questions.map((q, qi) => {
            const isDone = validated.has(qi);
            const isCorrect = isDone && isQuestionCorrect(q);
            const isCurrent = qi === index;
            return (
              <button
                key={q.id}
                onClick={() => setIndex(qi)}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-bold transition-all",
                  isCurrent && !isDone && "border-2 border-primary bg-primary/10 text-primary",
                  isDone && isCorrect && "bg-green-100 text-green-700",
                  isDone && !isCorrect && "bg-red-100 text-red-700",
                  !isCurrent && !isDone && "bg-primary/5 text-text-muted hover:bg-primary/10"
                )}
              >
                {isDone ? (isCorrect ? "✓" : "✗") : qi + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Clinical context */}
      {type === "CAS_CLINIQUE" && current.contexte && (
        <div className="rounded-xl border border-accent-gold/20 bg-warm-cream p-4 text-sm leading-relaxed text-foreground">
          {current.contexte}
        </div>
      )}

      {/* Question text */}
      <div>
        <h4 className="font-serif text-base font-semibold text-foreground leading-relaxed">
          {current.enonce}
        </h4>
        {correctCount > 1 && !isCurrentValidated && (
          <p className="mt-1.5 text-xs text-text-muted">
            ({correctCount} réponses correctes — cochez toutes les bonnes réponses)
          </p>
        )}
      </div>

      {/* Options */}
      <div className="space-y-2">
        {current.options.map((option) => {
          const isSelected = selectedIds.has(option.id);
          const isCorrect = option.correct;
          const showResult = isCurrentValidated;

          return (
            <div key={option.id} className="space-y-1">
              <button
                type="button"
                onClick={() => toggleOption(current.id, option.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border-2 p-3.5 text-left text-sm transition-all",
                  showResult && isCorrect
                    ? "border-green-400 bg-green-50"
                    : showResult && isSelected && !isCorrect
                      ? "border-red-300 bg-red-50"
                      : isSelected
                        ? "border-primary bg-primary/5"
                        : "border-primary/8 hover:border-primary/20 hover:bg-muted-cream/50"
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 text-[11px] font-bold transition-all",
                    showResult && isCorrect
                      ? "border-green-500 bg-green-500 text-white"
                      : showResult && isSelected && !isCorrect
                        ? "border-red-400 bg-red-400 text-white"
                        : isSelected
                          ? "border-primary bg-primary text-white"
                          : "border-primary/20 text-text-muted"
                  )}
                >
                  {showResult
                    ? (isCorrect ? "✓" : isSelected ? "✗" : option.id.toUpperCase())
                    : option.id.toUpperCase()
                  }
                </span>
                <span className="flex-1 leading-snug">{option.texte}</span>
              </button>
              {showResult && option.justification && (
                <div className={cn(
                  "ml-10 rounded-lg px-3 py-2 text-xs leading-relaxed",
                  isCorrect ? "bg-green-50 text-green-800 border border-green-100" : "bg-red-50 text-red-800 border border-red-100"
                )}>
                  {option.justification}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Result feedback for current question */}
      {isCurrentValidated && (
        <div className={cn(
          "flex items-center gap-3 rounded-xl border-2 p-4",
          isQuestionCorrect(current)
            ? "border-green-200 bg-green-50"
            : "border-red-200 bg-red-50"
        )}>
          {isQuestionCorrect(current) ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 shrink-0 text-red-600" />
          )}
          <p className={cn(
            "text-sm font-semibold",
            isQuestionCorrect(current) ? "text-green-800" : "text-red-800"
          )}>
            {isQuestionCorrect(current)
              ? "Bonne réponse !"
              : `Réponses correctes : ${[...correctIds].map((id) => id.toUpperCase()).join(", ")}`
            }
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={goPrev}
          disabled={index === 0}
          className="gap-1.5"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Précédent
        </Button>

        {!isCurrentValidated ? (
          <Button
            size="sm"
            onClick={validateCurrent}
            disabled={selectedIds.size === 0}
            className="gap-1.5"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Valider
          </Button>
        ) : index < questions.length - 1 ? (
          <Button
            size="sm"
            onClick={goNext}
            className="gap-1.5"
          >
            Suivante
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        ) : validated.size === questions.length ? (
          <Button
            size="sm"
            onClick={finishTest}
            className="gap-1.5 bg-accent-gold hover:bg-accent-gold/90 text-white shadow-sm"
          >
            <Trophy className="h-3.5 w-3.5" />
            Voir les résultats
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              // Find first unvalidated question
              const next = questions.findIndex((_, qi) => !validated.has(qi));
              if (next >= 0) setIndex(next);
            }}
            className="gap-1.5"
          >
            Question suivante non répondue
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
