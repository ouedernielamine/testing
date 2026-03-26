"use client";

import { useMemo, useState, useRef } from "react";
import { TestPlayer } from "@/components/test-player";
import { FicheResume } from "@/components/fiche-resume";
import { VideoEmbed } from "@/components/video-embed";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  BookOpen,
  FileText,
  Play,
  ClipboardCheck,
  ListOrdered,
  CheckCircle2,
  Download,
  RotateCcw,
  ArrowRight,
  Star,
  GraduationCap,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SommaireEntry = {
  titre: string;
  page: number;
};

type TestType = {
  id: string;
  titre: string;
  type: "QCM" | "CAS_CLINIQUE" | "VRAI_FAUX";
  dansLeCours: boolean;
  questions: {
    id: string;
    ordre: number;
    enonce: string;
    contexte?: string | null;
    options: Array<{ id: string; texte: string; correct: boolean; justification?: string }>;
  }[];
};

type ReaderProps = {
  titre: string;
  sommaire: SommaireEntry[];
  conclusion?: string | null;
  conclusionFileUrl?: string | null;
  conclusionFileName?: string | null;
  ficheResume?: string | null;
  ficheResumeFileUrl?: string | null;
  ficheResumeFileName?: string | null;
  rappelCoursFileUrl?: string | null;
  rappelCoursFileName?: string | null;
  videoUrl?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  tests: TestType[];
};

type SectionId = "cours" | "conclusion" | "rappel" | "fiche" | "video";

const SECTIONS: { id: SectionId; label: string; icon: React.ElementType }[] = [
  { id: "cours", label: "Cours", icon: BookOpen },
  { id: "conclusion", label: "Conclusion", icon: CheckCircle2 },
  { id: "rappel", label: "Rappel de cours", icon: RotateCcw },
  { id: "fiche", label: "Fiche résumé", icon: FileText },
  { id: "video", label: "Vidéo", icon: Play },
];

export function CoursReader({
  titre, sommaire, conclusion, conclusionFileUrl, conclusionFileName,
  ficheResume, ficheResumeFileUrl, ficheResumeFileName,
  rappelCoursFileUrl, rappelCoursFileName,
  videoUrl, fileUrl, fileName, tests,
}: ReaderProps) {
  const [activeSection, setActiveSection] = useState<SectionId>("cours");
  const [tocOpen, setTocOpen] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const inCourseTests = useMemo(() => tests.filter((t) => t.dansLeCours), [tests]);
  const outCourseTests = useMemo(() => tests.filter((t) => !t.dansLeCours), [tests]);
  const allTests = useMemo(() => [...inCourseTests, ...outCourseTests], [inCourseTests, outCourseTests]);

  /* ─── Test mode state ─── */
  const [testMode, setTestMode] = useState(false);
  const [activeTestId, setActiveTestId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { correct: number; total: number }>>({});

  const handleTestComplete = (testId: string, correct: number, total: number) => {
    setTestResults((prev) => ({ ...prev, [testId]: { correct, total } }));
    setActiveTestId(null);
  };

  const navigateToPage = (pageNum: number) => {
    if (iframeRef.current && fileUrl) {
      iframeRef.current.src = `${fileUrl}#page=${pageNum}`;
    }
  };

  /* ═══════════════════════════════════════════
     TEST MODE — replaces entire course view
     ═══════════════════════════════════════════ */
  if (testMode) {
    /* ── Active test (playing) ── */
    if (activeTestId) {
      const test = allTests.find((t) => t.id === activeTestId);
      if (!test) { setActiveTestId(null); return null; }
      return (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTestId(null)}
              className="gap-1.5 text-xs"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Retour
            </Button>
            <div className="flex-1 min-w-0">
              <h2 className="font-serif text-lg font-bold text-foreground truncate">{test.titre}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge className={cn(
                  "text-[10px] font-bold uppercase",
                  test.type === "QCM" ? "bg-primary/10 text-primary" : test.type === "VRAI_FAUX" ? "bg-amber-100 text-amber-700" : "bg-accent-rose/10 text-accent-rose"
                )}>
                  {test.type === "QCM" ? "QCM" : test.type === "VRAI_FAUX" ? "Vrai / Faux" : "Cas clinique"}
                </Badge>
                <span className="text-xs text-text-muted">
                  {test.questions.length} question{test.questions.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>
          <TestPlayer
            type={test.type}
            questions={test.questions}
            onComplete={(correct, total) => handleTestComplete(test.id, correct, total)}
          />
        </div>
      );
    }

    /* ── Test hub ── */
    const completedCount = Object.keys(testResults).length;
    const totalCorrect = Object.values(testResults).reduce((a, r) => a + r.correct, 0);
    const totalQuestions = Object.values(testResults).reduce((a, r) => a + r.total, 0);
    const globalPct = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    const globalStars = globalPct <= 40 ? 1 : globalPct <= 70 ? 2 : 3;
    const allDone = completedCount === allTests.length && allTests.length > 0;

    return (
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-accent-gold mb-1">
              <ClipboardCheck className="h-4 w-4" />
              Évaluation
            </div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              {titre}
            </h1>
          </div>
          <Button
            variant="outline"
            onClick={() => setTestMode(false)}
            className="gap-2 text-sm shrink-0"
          >
            <BookOpen className="h-4 w-4" />
            Retour au cours
          </Button>
        </div>

        {/* Global progress card */}
        <div className="rounded-2xl border border-primary/8 bg-gradient-to-br from-primary/5 via-warm-cream to-muted-cream p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <GraduationCap className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="font-serif text-lg font-bold text-foreground">
                {allDone ? "Tous les tests terminés !" : "Progression"}
              </h2>
              <p className="text-sm text-text-muted">
                {completedCount} / {allTests.length} test{allTests.length !== 1 ? "s" : ""} complété{completedCount !== 1 ? "s" : ""}
              </p>
            </div>
            {completedCount > 0 && (
              <div className="flex items-center gap-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Star key={i} className={cn("h-6 w-6", i < globalStars ? "fill-accent-gold text-accent-gold" : "text-primary/10")} />
                ))}
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-primary/10">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
              style={{ width: `${allTests.length > 0 ? (completedCount / allTests.length) * 100 : 0}%` }}
            />
          </div>

          {allDone && (
            <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-white/60 px-4 py-3">
              <Award className="h-5 w-5 text-accent-gold" />
              <span className="font-serif text-sm font-bold text-foreground">
                Score global : {globalPct}% — {totalCorrect}/{totalQuestions} correctes
              </span>
            </div>
          )}
        </div>

        {/* Avant le cours */}
        {inCourseTests.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <div className="h-px flex-1 bg-primary/10" />
              <span className="text-xs font-bold uppercase tracking-widest text-primary/60">Avant le cours</span>
              <div className="h-px flex-1 bg-primary/10" />
            </div>
            {inCourseTests.map((test) => (
              <TestCard key={test.id} test={test} result={testResults[test.id]} onStart={() => setActiveTestId(test.id)} />
            ))}
          </div>
        )}

        {/* Après le cours */}
        {outCourseTests.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <div className="h-px flex-1 bg-primary/10" />
              <span className="text-xs font-bold uppercase tracking-widest text-primary/60">Après le cours</span>
              <div className="h-px flex-1 bg-primary/10" />
            </div>
            {outCourseTests.map((test) => (
              <TestCard key={test.id} test={test} result={testResults[test.id]} onStart={() => setActiveTestId(test.id)} />
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ═══════════════════════════════════════════
     COURSE MODE — normal reading view
     ═══════════════════════════════════════════ */
  return (
    <div className="flex flex-col gap-6">
      {/* Header + Terminer button */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-accent-gold mb-2">
            <BookOpen className="h-4 w-4" />
            Lecture
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {titre}
          </h1>
        </div>
        {allTests.length > 0 && (
          <Button
            onClick={() => setTestMode(true)}
            className="gap-2 px-5 py-2.5 text-sm font-semibold shadow-md shadow-primary/20 shrink-0"
          >
            <GraduationCap className="h-4 w-4" />
            Passer aux tests
          </Button>
        )}
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-primary/8 bg-surface p-1">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-all",
              activeSection === s.id
                ? "bg-primary text-white shadow-sm"
                : "text-text-muted hover:bg-muted-cream hover:text-foreground"
            )}
          >
            <s.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{s.label}</span>
          </button>
        ))}
      </div>

      {/* ─── COURS SECTION (PDF + Sommaire) ─── */}
      {activeSection === "cours" && (
        <div className="flex gap-6">
          {/* Sommaire sidebar */}
          {tocOpen && sommaire.length > 0 && (
            <aside className="hidden w-64 shrink-0 lg:block">
              <div className="sticky top-4 rounded-2xl border border-primary/8 bg-surface p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-accent-gold">
                    <ListOrdered className="h-3.5 w-3.5" />
                    Sommaire
                  </h3>
                  <button
                    onClick={() => setTocOpen(false)}
                    className="text-text-muted hover:text-foreground"
                    aria-label="Fermer le sommaire"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                </div>
                <Separator className="mb-3 bg-primary/8" />
                <ScrollArea className="max-h-[60vh]">
                  <nav className="space-y-0.5">
                    {sommaire.map((entry, i) => {
                      const depth = getHeadingDepth(entry.titre);
                      return (
                        <button
                          key={i}
                          onClick={() => navigateToPage(entry.page)}
                          className={cn(
                            "w-full text-left rounded-lg py-2 text-[13px] leading-snug transition-all",
                            depth === 0 && "px-2.5 font-semibold",
                            depth === 1 && "pl-5 pr-2.5 font-medium",
                            depth >= 2 && "pl-8 pr-2.5 text-[12px]",
                            "text-text-muted hover:bg-primary/5 hover:text-primary"
                          )}
                        >
                          {entry.page > 1 && (
                            <span className="mr-1.5 text-xs font-semibold text-primary/40 tabular-nums">
                              p.{entry.page}
                            </span>
                          )}
                          {entry.titre}
                        </button>
                      );
                    })}
                  </nav>
                </ScrollArea>

                {fileUrl && (
                  <>
                    <Separator className="my-3 bg-primary/8" />
                    <a
                      href={fileUrl}
                      download={fileName || `${titre}.pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 rounded-lg bg-primary/8 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/15"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Télécharger PDF
                    </a>
                  </>
                )}
              </div>
            </aside>
          )}

          {/* Main PDF viewer */}
          <div className="flex-1 min-w-0">
            {!tocOpen && sommaire.length > 0 && (
              <div className="mb-4">
                <button
                  onClick={() => setTocOpen(true)}
                  className="hidden rounded-lg border border-primary/8 p-2 text-text-muted transition hover:bg-muted-cream hover:text-foreground lg:flex items-center gap-2 text-xs font-medium"
                  aria-label="Ouvrir le sommaire"
                >
                  <ListOrdered className="h-4 w-4" />
                  Sommaire
                </button>
              </div>
            )}

            <article className="rounded-2xl border border-primary/8 bg-surface shadow-sm overflow-hidden">
              {fileUrl ? (
                <iframe
                  ref={iframeRef}
                  src={fileUrl}
                  className="h-[80vh] w-full"
                  title="Document du cours"
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <BookOpen className="h-10 w-10 text-primary/20" />
                  <p className="mt-3 text-sm text-text-muted">
                    Aucun document PDF disponible pour ce chapitre.
                  </p>
                </div>
              )}
            </article>
          </div>
        </div>
      )}

      {/* ─── CONCLUSION ─── */}
      {activeSection === "conclusion" && (
        <article className="rounded-2xl border border-primary/8 bg-surface shadow-sm">
          <div className="border-b border-primary/8 px-6 py-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-foreground">
              <CheckCircle2 className="h-5 w-5 text-accent-gold" />
              Conclusion
            </h2>
            {conclusionFileUrl && (
              <a
                href={conclusionFileUrl}
                download={conclusionFileName || "conclusion.pdf"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark"
              >
                <Download className="h-4 w-4" />
                Télécharger
              </a>
            )}
          </div>
          <div className="px-6 py-5">
            {conclusionFileUrl ? (
              <iframe
                src={conclusionFileUrl}
                className="h-[70vh] w-full rounded-xl border border-primary/8"
                title="Conclusion PDF"
              />
            ) : conclusion ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-muted">
                {conclusion}
              </p>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CheckCircle2 className="h-10 w-10 text-primary/20" />
                <p className="mt-3 text-sm text-text-muted">La conclusion sera ajoutée prochainement.</p>
              </div>
            )}
          </div>
        </article>
      )}

      {/* ─── RAPPEL DE COURS ─── */}
      {activeSection === "rappel" && (
        <article className="rounded-2xl border border-primary/8 bg-surface shadow-sm">
          <div className="border-b border-primary/8 px-6 py-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-foreground">
              <RotateCcw className="h-5 w-5 text-accent-gold" />
              Rappel de cours
            </h2>
            {rappelCoursFileUrl && (
              <a
                href={rappelCoursFileUrl}
                download={rappelCoursFileName || "rappel-de-cours.pdf"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark"
              >
                <Download className="h-4 w-4" />
                Télécharger
              </a>
            )}
          </div>
          <div className="px-6 py-5">
            {rappelCoursFileUrl ? (
              <iframe
                src={rappelCoursFileUrl}
                className="h-[70vh] w-full rounded-xl border border-primary/8"
                title="Rappel de cours PDF"
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <RotateCcw className="h-10 w-10 text-primary/20" />
                <p className="mt-3 text-sm text-text-muted">Le rappel de cours sera ajouté prochainement.</p>
              </div>
            )}
          </div>
        </article>
      )}

      {/* ─── FICHE RÉSUMÉ ─── */}
      {activeSection === "fiche" && (
        <article className="rounded-2xl border border-primary/8 bg-surface shadow-sm">
          <div className="border-b border-primary/8 px-6 py-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-foreground">
              <FileText className="h-5 w-5 text-accent-gold" />
              Fiche résumé
            </h2>
            {ficheResumeFileUrl && (
              <a
                href={ficheResumeFileUrl}
                download={ficheResumeFileName || "fiche-resume.pdf"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark"
              >
                <Download className="h-4 w-4" />
                Télécharger
              </a>
            )}
          </div>
          <div className="px-6 py-5">
            {ficheResumeFileUrl ? (
              <iframe
                src={ficheResumeFileUrl}
                className="h-[70vh] w-full rounded-xl border border-primary/8"
                title="Fiche résumé PDF"
              />
            ) : ficheResume ? (
              <FicheResume value={ficheResume} />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FileText className="h-10 w-10 text-primary/20" />
                <p className="mt-3 text-sm text-text-muted">La fiche résumé sera ajoutée prochainement.</p>
              </div>
            )}
          </div>
        </article>
      )}

      {/* ─── VIDEO ─── */}
      {activeSection === "video" && (
        <article className="rounded-2xl border border-primary/8 bg-surface shadow-sm">
          <div className="border-b border-primary/8 px-6 py-4">
            <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-foreground">
              <Play className="h-5 w-5 text-accent-gold" />
              Vidéo
            </h2>
          </div>
          <div className="p-6">
            <VideoEmbed url={videoUrl} />
          </div>
        </article>
      )}
    </div>
  );
}

/* ─── Helpers ─── */
function getHeadingDepth(titre: string): number {
  const numMatch = titre.match(/^(\d+(?:\.\d+)*)/);
  if (numMatch) return Math.min(numMatch[1].split(".").length - 1, 2);
  return 0;
}

/* ─── Test Card ─── */
function TestCard({
  test,
  result,
  onStart,
}: {
  test: TestType;
  result?: { correct: number; total: number };
  onStart: () => void;
}) {
  const done = !!result;
  const percentage = done ? Math.round((result.correct / result.total) * 100) : 0;
  const stars = percentage <= 40 ? 1 : percentage <= 70 ? 2 : 3;

  const typeBadge = test.type === "QCM"
    ? { label: "QCM", cls: "bg-primary/10 text-primary" }
    : test.type === "VRAI_FAUX"
      ? { label: "Vrai / Faux", cls: "bg-amber-100 text-amber-700" }
      : { label: "Cas clinique", cls: "bg-accent-rose/10 text-accent-rose" };

  return (
    <div
      className={cn(
        "group flex items-center gap-4 rounded-2xl border bg-surface px-5 py-4 transition-all",
        done
          ? "border-green-200 bg-green-50/30"
          : "border-primary/8 hover:border-primary/20 hover:shadow-sm"
      )}
    >
      <div className={cn(
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
        done ? "bg-green-100" : "bg-primary/8"
      )}>
        {done ? (
          <CheckCircle2 className="h-6 w-6 text-green-600" />
        ) : (
          <ClipboardCheck className="h-6 w-6 text-primary" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-serif text-sm font-bold text-foreground truncate">{test.titre}</h3>
          <Badge className={cn("text-[10px] font-bold uppercase", typeBadge.cls)}>{typeBadge.label}</Badge>
        </div>
        <p className="mt-0.5 text-xs text-text-muted">
          {test.questions.length} question{test.questions.length !== 1 ? "s" : ""}
          {done && (
            <span className="ml-2">
              · {result.correct}/{result.total} correcte{result.correct !== 1 ? "s" : ""}
              · {percentage}%
            </span>
          )}
        </p>
        {done && (
          <div className="mt-1 flex items-center gap-0.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-4 w-4",
                  i < stars ? "fill-accent-gold text-accent-gold" : "text-primary/15"
                )}
              />
            ))}
          </div>
        )}
      </div>

      <Button
        size="sm"
        variant={done ? "outline" : "default"}
        onClick={onStart}
        className={cn("gap-1.5 shrink-0", !done && "shadow-sm shadow-primary/15")}
      >
        {done ? (
          <>
            <RotateCcw className="h-3.5 w-3.5" />
            Refaire
          </>
        ) : (
          <>
            Commencer
            <ArrowRight className="h-3.5 w-3.5" />
          </>
        )}
      </Button>
    </div>
  );
}
