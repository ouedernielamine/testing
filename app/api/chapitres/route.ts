import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const chapitres = await db.chapitre.findMany({
    orderBy: { numero: "asc" },
    include: {
      tests: { include: { questions: { orderBy: { ordre: "asc" } } } },
    },
  });

  return NextResponse.json(chapitres);
}

export async function POST(req: Request) {
  const body = await req.json();

  const chapitre = await db.chapitre.create({
    data: {
      numero: body.numero,
      titre: body.titre,
      description: body.description,
      fileUrl: body.fileUrl,
      fileName: body.fileName,
      sommaire: body.sommaire ?? null,
      videoUrl: body.videoUrl,
      conclusion: body.conclusion,
      conclusionFileUrl: body.conclusionFileUrl,
      conclusionFileName: body.conclusionFileName,
      ficheResume: body.ficheResume,
      ficheResumeFileUrl: body.ficheResumeFileUrl,
      ficheResumeFileName: body.ficheResumeFileName,
      rappelCours: null,
      rappelCoursFileUrl: body.rappelCoursFileUrl,
      rappelCoursFileName: body.rappelCoursFileName,
      tests: {
        create: (body.tests ?? []).map((test: any) => ({
          titre: test.titre,
          type: test.type,
          dansLeCours: !!test.dansLeCours,
          questions: {
            create: (test.questions ?? []).map((q: any, qIndex: number) => ({
              ordre: q.ordre ?? qIndex + 1,
              enonce: q.enonce,
              contexte: q.contexte,
              options: q.options,
            })),
          },
        })),
      },
    },
    include: {
      tests: { include: { questions: true } },
    },
  });

  return NextResponse.json(chapitre, { status: 201 });
}
