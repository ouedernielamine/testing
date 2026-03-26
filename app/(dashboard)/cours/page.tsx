import Link from "next/link";
import { db } from "@/lib/db";
import { BookOpen, ChevronRight, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

const CHAPITRE_ICONS = ["🩺", "🔬", "📋", "🧬"];

export default async function CoursListPage() {
  const chapitres = await db.chapitre.findMany({
    orderBy: { numero: "asc" },
    include: {
      tests: { select: { id: true } },
    },
  });

  return (
    <>
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-accent-gold font-semibold uppercase tracking-widest mb-2">
          <BookOpen className="h-4 w-4" />
          Programme
        </div>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
          Chapitres disponibles
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-muted">
          Parcourez les chapitres d'oncologie gynécologique et mammaire.
          Chaque chapitre contient un cours structuré, des fiches de révision
          et des tests interactifs.
        </p>
      </div>

      {/* Cards grid */}
      <div className="grid gap-5 sm:grid-cols-2">
        {chapitres.map((chapitre: any, i: number) => (
          <Link
            key={chapitre.id}
            href={`/cours/${chapitre.id}`}
            className="group relative overflow-hidden rounded-2xl border border-primary/8 bg-surface p-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5"
          >
            {/* Top accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-primary via-primary-light to-primary" />

            <div className="p-6">
              {/* Watermark number */}
              <span className="absolute -right-2 -top-2 font-serif text-[6rem] font-bold leading-none text-primary/[0.03]">
                {String(chapitre.numero).padStart(2, "0")}
              </span>

              <div className="relative">
                {/* Icon + badge row */}
                <div className="flex items-start justify-between">
                  <span className="text-3xl">
                    {CHAPITRE_ICONS[i] || "📖"}
                  </span>
                  <span className="rounded-full bg-primary/8 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                    Chapitre {chapitre.numero}
                  </span>
                </div>

                {/* Title */}
                <h2 className="mt-4 font-serif text-xl font-bold text-foreground transition-colors group-hover:text-primary">
                  {chapitre.titre}
                </h2>

                {/* Description */}
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-text-muted">
                  {chapitre.description || "Contenu en cours de rédaction."}
                </p>

                {/* Stats row */}
                <div className="mt-4 flex items-center gap-4 text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {chapitre.tests.length} test{chapitre.tests.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* CTA */}
                <div className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-primary opacity-0 transition-all duration-200 group-hover:opacity-100">
                  Ouvrir le chapitre
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty state */}
      {chapitres.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-primary/15 bg-muted-cream/50 py-16 text-center">
          <BookOpen className="h-10 w-10 text-primary/30" />
          <p className="mt-4 font-serif text-lg font-semibold text-foreground">
            Aucun chapitre disponible
          </p>
          <p className="mt-1 text-sm text-text-muted">
            Les chapitres seront ajoutés prochainement.
          </p>
        </div>
      )}
    </>
  );
}
