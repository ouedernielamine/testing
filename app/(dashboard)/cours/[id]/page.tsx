import { notFound } from "next/navigation";
import Link from "next/link";
import { CoursReader } from "@/components/cours-reader";
import { db } from "@/lib/db";
import { ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ChapitrePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const chapitre = await db.chapitre.findUnique({
    where: { id },
    include: {
      tests: { include: { questions: { orderBy: { ordre: "asc" } } } },
    },
  });

  if (!chapitre) {
    notFound();
  }

  return (
    <>
      <Link
        href="/cours"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-text-muted transition-colors hover:text-primary"
      >
        <ChevronLeft className="h-4 w-4" />
        Retour aux chapitres
      </Link>
      <CoursReader
        titre={chapitre.titre}
        sommaire={(chapitre.sommaire as { titre: string; page: number }[]) ?? []}
        conclusion={chapitre.conclusion}
        conclusionFileUrl={chapitre.conclusionFileUrl}
        conclusionFileName={chapitre.conclusionFileName}
        ficheResume={chapitre.ficheResume}
        ficheResumeFileUrl={chapitre.ficheResumeFileUrl}
        ficheResumeFileName={chapitre.ficheResumeFileName}
        rappelCoursFileUrl={chapitre.rappelCoursFileUrl}
        rappelCoursFileName={chapitre.rappelCoursFileName}
        videoUrl={chapitre.videoUrl}
        fileUrl={chapitre.fileUrl}
        fileName={chapitre.fileName}
        tests={chapitre.tests as any}
      />
    </>
  );
}
